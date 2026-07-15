import {
  clarifyOrder,
  type ClarifyDecisionId,
  type ClarifyRoleId,
  type ClarifyWorkstreamId,
  type RiskDispositionId,
} from '../content/clarifyOrder'
import type { CampaignRuleEvidence } from './campaignMachine'

export const MINIMUM_CLARIFY_TEXT_LENGTH = 24

export type ClarifyOrderStage =
  | 'locked'
  | 'dialogue'
  | 'order-sheet'
  | 'gate'
  | 'complete'

export type ClarifyAssignments = Record<
  ClarifyWorkstreamId,
  ClarifyRoleId | null
>

export interface ClarifyOrderState {
  stage: ClarifyOrderStage
  dialogueIndex: number
  purposeAndScope: string
  informationFlow: string
  serviceDocumentation: string
  riskDispositionId: RiskDispositionId | null
  assignments: ClarifyAssignments
  selectedDecisionId: ClarifyDecisionId | null
  feedback: string | null
  unsuccessfulAttempts: number
}
export type ClarifyOrderEvent =
  | { type: 'BEGIN' }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'SET_PURPOSE_SCOPE'; value: string }
  | { type: 'SET_INFORMATION_FLOW'; value: string }
  | { type: 'SET_SERVICE_DOCUMENTATION'; value: string }
  | { type: 'SET_RISK_DISPOSITION'; value: RiskDispositionId }
  | {
      type: 'ASSIGN_OWNER'
      workstreamId: ClarifyWorkstreamId
      roleId: ClarifyRoleId | null
    }
  | { type: 'SUBMIT_ORDER_SHEET' }
  | { type: 'CHOOSE_DECISION'; decisionId: ClarifyDecisionId }
  | { type: 'RESET' }

const emptyAssignments: ClarifyAssignments = {
  'purpose-and-privacy': null,
  'risk-and-dpia': null,
  'service-readiness': null,
}

export const initialClarifyOrderState: ClarifyOrderState = {
  stage: 'locked',
  dialogueIndex: 0,
  purposeAndScope: '',
  informationFlow: '',
  serviceDocumentation: '',
  riskDispositionId: null,
  assignments: { ...emptyAssignments },
  selectedDecisionId: null,
  feedback: null,
  unsuccessfulAttempts: 0,
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function fieldError(label: string) {
  return `${label} må beskrives med minst ${MINIMUM_CLARIFY_TEXT_LENGTH} tegn.`
}

export function clarifyOrderReducer(
  state: ClarifyOrderState,
  event: ClarifyOrderEvent,
): ClarifyOrderState {
  switch (event.type) {
    case 'BEGIN':
      if (state.stage !== 'locked') return state
      return { ...state, stage: 'dialogue', feedback: null }

    case 'ADVANCE_DIALOGUE': {
      if (state.stage !== 'dialogue') return state
      const lastIndex = clarifyOrder.npc.dialogue.length - 1
      if (state.dialogueIndex >= lastIndex) {
        return { ...state, stage: 'order-sheet', feedback: null }
      }
      return { ...state, dialogueIndex: state.dialogueIndex + 1 }
    }

    case 'SET_PURPOSE_SCOPE':
      if (state.stage !== 'order-sheet') return state
      return { ...state, purposeAndScope: event.value, feedback: null }

    case 'SET_INFORMATION_FLOW':
      if (state.stage !== 'order-sheet') return state
      return { ...state, informationFlow: event.value, feedback: null }

    case 'SET_SERVICE_DOCUMENTATION':
      if (state.stage !== 'order-sheet') return state
      return { ...state, serviceDocumentation: event.value, feedback: null }

    case 'SET_RISK_DISPOSITION':
      if (state.stage !== 'order-sheet') return state
      return { ...state, riskDispositionId: event.value, feedback: null }

    case 'ASSIGN_OWNER':
      if (state.stage !== 'order-sheet') return state
      return {
        ...state,
        assignments: {
          ...state.assignments,
          [event.workstreamId]: event.roleId,
        },
        feedback: null,
      }

    case 'SUBMIT_ORDER_SHEET': {
      if (state.stage !== 'order-sheet') return state
      const purposeAndScope = normalizeText(state.purposeAndScope)
      const informationFlow = normalizeText(state.informationFlow)
      const serviceDocumentation = normalizeText(state.serviceDocumentation)
      const normalized = {
        ...state,
        purposeAndScope,
        informationFlow,
        serviceDocumentation,
      }

      if (purposeAndScope.length < MINIMUM_CLARIFY_TEXT_LENGTH) {
        return { ...normalized, feedback: fieldError('Formål og omfang') }
      }
      if (informationFlow.length < MINIMUM_CLARIFY_TEXT_LENGTH) {
        return { ...normalized, feedback: fieldError('Informasjonsflyt og dataretning') }
      }
      if (serviceDocumentation.length < MINIMUM_CLARIFY_TEXT_LENGTH) {
        return { ...normalized, feedback: fieldError('Tjeneste og dokumentasjonsstatus') }
      }
      const missingOwner = clarifyOrder.workstreams.find(
        (workstream) => !state.assignments[workstream.id],
      )
      if (missingOwner) {
        return {
          ...normalized,
          feedback: `Tildel ansvar for «${missingOwner.title}».`,
        }
      }
      const wrongOwner = clarifyOrder.workstreams.find(
        (workstream) =>
          state.assignments[workstream.id] !== workstream.correctRoleId,
      )
      if (wrongOwner) {
        return {
          ...normalized,
          feedback: `Rollen for «${wrongOwner.title}» kan ikke gi den nødvendige faglige vurderingen.`,
        }
      }
      const riskDisposition = clarifyOrder.riskDispositions.find(
        (choice) => choice.id === state.riskDispositionId,
      )
      if (!riskDisposition?.acceptable) {
        return {
          ...normalized,
          feedback:
            'Planlegg risikovurdering og en begrunnet DPIA-screening før behandlingen starter.',
        }
      }

      return {
        ...normalized,
        stage: 'gate',
        feedback:
          'Bestillingsgrunnlaget har omfang, eiere og åpne godkjenninger. Ansvarsporten er klar.',
      }
    }

    case 'CHOOSE_DECISION': {
      if (state.stage !== 'gate') return state
      const decision = clarifyOrder.decisions.find(
        (candidate) => candidate.id === event.decisionId,
      )
      if (!decision) return state
      return {
        ...state,
        stage: decision.completesGate ? 'complete' : 'gate',
        selectedDecisionId: decision.id,
        feedback: decision.consequence,
        unsuccessfulAttempts:
          state.unsuccessfulAttempts + (decision.completesGate ? 0 : 1),
      }
    }

    case 'RESET':
      return initialClarifyOrderState
  }
}

function roleLabel(roleId: ClarifyRoleId | null) {
  return clarifyOrder.roles.find((role) => role.id === roleId)?.label ?? 'Ikke tildelt'
}

export function buildClarifyRuleEvidence(
  state: ClarifyOrderState,
  priorNeed: string,
  actorSummary: string,
): CampaignRuleEvidence[] {
  if (state.stage !== 'complete') return []

  return [
    {
      ruleId: 'co-purpose-legal-basis',
      outcome: 'satisfied',
      rationale:
        'Formål og behandlingsrammer er dokumentert for læringsporten; juridisk og behandlingsansvarlig godkjenning gjenstår.',
      evidence: [
        `Formål og omfang: ${state.purposeAndScope}`,
        `Faglig eier: ${roleLabel(state.assignments['purpose-and-privacy'])}`,
        'Godkjenningsstatus: avventer personvernjurist eller personvernombud og behandlingsansvarlig.',
      ],
    },
    {
      ruleId: 'co-risk-dpia',
      outcome: 'satisfied',
      rationale:
        'Risiko og behov for DPIA skal vurderes før behandling starter; læringssteget dokumenterer bestilling, ikke ferdig fagvurdering.',
      evidence: [
        `Informasjonsflyt: ${state.informationFlow}`,
        'Risiko/DPIA-status: risikovurdering og DPIA-screening er bestilt, men ikke faglig godkjent.',
        `Faglig eier: ${roleLabel(state.assignments['risk-and-dpia'])}`,
      ],
    },
    {
      ruleId: 'co-need-before-connection',
      outcome: 'satisfied',
      rationale:
        'Behov, aktører, informasjonsflyt og tjenestedokumentasjon er synliggjort før teknisk forbindelsestype vurderes.',
      evidence: [
        `Behov: ${priorNeed}`,
        `Aktører: ${actorSummary}`,
        `Tjeneste og dokumentasjonsstatus: ${state.serviceDocumentation}`,
        `Ansvarlig: ${roleLabel(state.assignments['service-readiness'])}`,
      ],
    },
  ]
}
