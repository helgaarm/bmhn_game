import { connect, type ConnectDecisionId, type ConnectRouteId, type ConnectServiceId } from '../content/connect'
import type { CampaignRuleEvidence } from './campaignMachine'

export type ConnectStage = 'locked' | 'dialogue' | 'route-map' | 'gate' | 'complete'

export interface ConnectState {
  stage: ConnectStage
  dialogueIndex: number
  selectedServiceId: ConnectServiceId | null
  selectedRouteId: ConnectRouteId | null
  rationale: string
  selectedDecisionId: ConnectDecisionId | null
  feedback: string | null
  unsuccessfulAttempts: number
}

export type ConnectEvent =
  | { type: 'BEGIN' }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'SELECT_SERVICE'; serviceId: ConnectServiceId }
  | { type: 'SELECT_ROUTE'; routeId: ConnectRouteId }
  | { type: 'SET_RATIONALE'; value: string }
  | { type: 'SUBMIT_ROUTE' }
  | { type: 'CHOOSE_DECISION'; decisionId: ConnectDecisionId }
  | { type: 'RESET' }

export const initialConnectState: ConnectState = {
  stage: 'locked',
  dialogueIndex: 0,
  selectedServiceId: null,
  selectedRouteId: null,
  rationale: '',
  selectedDecisionId: null,
  feedback: null,
  unsuccessfulAttempts: 0,
}

export function connectReducer(state: ConnectState, event: ConnectEvent): ConnectState {
  switch (event.type) {
    case 'BEGIN':
      return state.stage === 'locked' ? { ...state, stage: 'dialogue' } : state
    case 'ADVANCE_DIALOGUE':
      if (state.stage !== 'dialogue') return state
      return state.dialogueIndex < connect.npc.dialogue.length - 1
        ? { ...state, dialogueIndex: state.dialogueIndex + 1 }
        : { ...state, stage: 'route-map', feedback: null }
    case 'SELECT_SERVICE':
      return state.stage === 'route-map'
        ? { ...state, selectedServiceId: event.serviceId, selectedRouteId: null, feedback: null }
        : state
    case 'SELECT_ROUTE':
      return state.stage === 'route-map'
        ? { ...state, selectedRouteId: event.routeId, feedback: null }
        : state
    case 'SET_RATIONALE':
      return state.stage === 'route-map' ? { ...state, rationale: event.value } : state
    case 'SUBMIT_ROUTE': {
      if (state.stage !== 'route-map') return state
      if (!state.selectedServiceId) return { ...state, feedback: 'Velg et dokumentert tjenestekort først.' }
      if (!state.selectedRouteId) return { ...state, feedback: 'Velg en samarbeids- og forbindelsesvei.' }
      if (state.rationale.trim().length < 24) {
        return { ...state, feedback: 'Begrunn valget med minst 24 tegn fra aktørtype og tjenestedokumentasjon.' }
      }
      const service = connect.services.find((item) => item.id === state.selectedServiceId)
      if (!service || service.correctRouteId !== state.selectedRouteId) {
        const route = connect.routes.find((item) => item.id === state.selectedRouteId)
        return {
          ...state,
          feedback: route?.consequence ?? 'Valgt vei følger ikke tjenestekortet.',
          unsuccessfulAttempts: state.unsuccessfulAttempts + 1,
        }
      }
      return {
        ...state,
        stage: 'gate',
        feedback: 'Valget følger det syntetiske tjenestekortet. Produksjon er fortsatt blokkert.',
      }
    }
    case 'CHOOSE_DECISION': {
      if (state.stage !== 'gate') return state
      const decision = connect.decisions.find((item) => item.id === event.decisionId)
      if (!decision) return state
      return decision.completesGate
        ? { ...state, stage: 'complete', selectedDecisionId: event.decisionId, feedback: decision.consequence }
        : {
            ...state,
            selectedDecisionId: event.decisionId,
            feedback: decision.consequence,
            unsuccessfulAttempts: state.unsuccessfulAttempts + 1,
          }
    }
    case 'RESET':
      return initialConnectState
  }
}

export function buildConnectRuleEvidence(state: ConnectState): CampaignRuleEvidence[] {
  const service = connect.services.find((item) => item.id === state.selectedServiceId)
  if (!service || state.stage !== 'complete') return []
  const isProfessionalFhir = service.id === 'professional-fhir'
  const contextEvidence = `${service.title}: ${service.documentation}`

  if (!isProfessionalFhir) {
    return connect.requiredRuleIds.map((ruleId) => ({
      ruleId,
      outcome: 'not-applicable' as const,
      rationale: `Tjenestekortet annonserer ikke funksjonen som utløser ${ruleId}; videre avklaring går til tjenesteeier.`,
      evidence: [contextEvidence, `Aktørtype: ${service.actorType}`, `Spillerbegrunnelse: ${state.rationale}`],
    }))
  }

  return [
    {
      ruleId: 'cn-helseid-suitability',
      outcome: 'satisfied',
      rationale: 'HelseID vurderes for helsepersonell og fagsystem fordi det syntetiske kortet uttrykkelig annonserer HelseID.',
      evidence: [contextEvidence, `Aktørtype: ${service.actorType}`],
    },
    {
      ruleId: 'cn-helseid-production',
      outcome: 'satisfied',
      rationale: 'Valgt vei starter i test og beholder produksjon blokkert til faktisk onboarding-evidens er kontrollert.',
      evidence: ['Plan: HelseID testmiljø først', 'Produksjonsstatus: blokkert – leverandørvilkår, tilgang og kodegjennomgang gjenstår'],
    },
    {
      ruleId: 'cn-helseid-client',
      outcome: 'satisfied',
      rationale: 'Valgt læringsarkitektur bruker en konfidensiell backend og avviser en nettleserklient som bærer hemmeligheter.',
      evidence: ['Arkitekturmønster: konfidensiell backend', `Spillerbegrunnelse: ${state.rationale}`],
    },
    {
      ruleId: 'cn-fhir-conformance',
      outcome: 'satisfied',
      rationale: 'Kortet navngir FHIR R4, mens CapabilityStatement, implementasjonsguide og profiler beholdes som åpne kontrollpunkter.',
      evidence: ['Syntetisk annonsert versjon: FHIR R4 4.0.1', 'Åpent: hent CapabilityStatement og valider mot tjenestens navngitte profiler'],
    },
    {
      ruleId: 'cn-smart-launch',
      outcome: 'not-applicable',
      rationale: 'SMART velges ikke fordi det syntetiske tjenestekortet ikke annonserer SMART App Launch.',
      evidence: [contextEvidence, 'SMART-status: ikke annonsert'],
    },
  ]
}
