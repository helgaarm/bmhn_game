import {
  understandAssess,
  type AssessmentActorId,
  type AssessmentDecisionId,
} from '../content/understandAssess'

export const MINIMUM_ASSESSMENT_TEXT_LENGTH = 24
export const MINIMUM_ACTOR_COUNT = 3

export type AssessmentStage =
  | 'locked'
  | 'dialogue'
  | 'actor-map'
  | 'gate'
  | 'complete'

export interface AssessmentState {
  stage: AssessmentStage
  dialogueIndex: number
  requiredActorId: AssessmentActorId | null
  selectedActorIds: AssessmentActorId[]
  expectedValue: string
  uncertainty: string
  selectedDecisionId: AssessmentDecisionId | null
  feedback: string | null
  unsuccessfulAttempts: number
}
export type AssessmentEvent =
  | { type: 'BEGIN'; requiredActorId: AssessmentActorId }
  | { type: 'ADVANCE_DIALOGUE' }
  | { type: 'TOGGLE_ACTOR'; actorId: AssessmentActorId }
  | { type: 'SET_EXPECTED_VALUE'; value: string }
  | { type: 'SET_UNCERTAINTY'; value: string }
  | { type: 'SUBMIT_MAPPING' }
  | { type: 'CHOOSE_DECISION'; decisionId: AssessmentDecisionId }
  | { type: 'RESET' }

export const initialAssessmentState: AssessmentState = {
  stage: 'locked',
  dialogueIndex: 0,
  requiredActorId: null,
  selectedActorIds: [],
  expectedValue: '',
  uncertainty: '',
  selectedDecisionId: null,
  feedback: null,
  unsuccessfulAttempts: 0,
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

export function assessmentReducer(
  state: AssessmentState,
  event: AssessmentEvent,
): AssessmentState {
  switch (event.type) {
    case 'BEGIN':
      if (state.stage !== 'locked') return state
      return {
        ...state,
        stage: 'dialogue',
        requiredActorId: event.requiredActorId,
        selectedActorIds: [event.requiredActorId],
      }

    case 'ADVANCE_DIALOGUE': {
      if (state.stage !== 'dialogue') return state
      const lastIndex = understandAssess.npc.dialogue.length - 1
      if (state.dialogueIndex >= lastIndex) {
        return { ...state, stage: 'actor-map', feedback: null }
      }
      return { ...state, dialogueIndex: state.dialogueIndex + 1 }
    }

    case 'TOGGLE_ACTOR': {
      if (state.stage !== 'actor-map') return state
      if (event.actorId === state.requiredActorId) {
        return {
          ...state,
          feedback: 'Målgruppen fra forrige steg må være med i aktørbildet.',
        }
      }
      const isSelected = state.selectedActorIds.includes(event.actorId)
      return {
        ...state,
        selectedActorIds: isSelected
          ? state.selectedActorIds.filter((id) => id !== event.actorId)
          : [...state.selectedActorIds, event.actorId],
        feedback: null,
      }
    }

    case 'SET_EXPECTED_VALUE':
      if (state.stage !== 'actor-map') return state
      return { ...state, expectedValue: event.value, feedback: null }

    case 'SET_UNCERTAINTY':
      if (state.stage !== 'actor-map') return state
      return { ...state, uncertainty: event.value, feedback: null }

    case 'SUBMIT_MAPPING': {
      if (state.stage !== 'actor-map') return state
      const expectedValue = normalizeText(state.expectedValue)
      const uncertainty = normalizeText(state.uncertainty)

      if (
        !state.requiredActorId ||
        !state.selectedActorIds.includes(state.requiredActorId)
      ) {
        return {
          ...state,
          feedback: 'Ta med målgruppen fra forrige steg i aktørbildet.',
        }
      }
      if (state.selectedActorIds.length < MINIMUM_ACTOR_COUNT) {
        return {
          ...state,
          feedback: `Velg minst ${MINIMUM_ACTOR_COUNT} berørte aktører for å sammenligne perspektiver.`,
        }
      }
      if (expectedValue.length < MINIMUM_ASSESSMENT_TEXT_LENGTH) {
        return {
          ...state,
          expectedValue,
          uncertainty,
          feedback: `Beskriv forventet verdi med minst ${MINIMUM_ASSESSMENT_TEXT_LENGTH} tegn.`,
        }
      }
      if (uncertainty.length < MINIMUM_ASSESSMENT_TEXT_LENGTH) {
        return {
          ...state,
          expectedValue,
          uncertainty,
          feedback: `Beskriv en reell usikkerhet med minst ${MINIMUM_ASSESSMENT_TEXT_LENGTH} tegn.`,
        }
      }

      return {
        ...state,
        stage: 'gate',
        expectedValue,
        uncertainty,
        feedback: 'Aktørbildet viser både forventet verdi og åpen usikkerhet. Porten er klar.',
      }
    }

    case 'CHOOSE_DECISION': {
      if (state.stage !== 'gate') return state
      const decision = understandAssess.decisions.find(
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
      return initialAssessmentState
  }
}
