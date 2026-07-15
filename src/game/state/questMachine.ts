import {
  verticalSlice,
  type AudienceId,
  type DecisionId,
} from '../content/verticalSlice'
import { evaluateNeedReadiness } from '../adapters/needReadinessAdapter'

export { MINIMUM_NEED_LENGTH } from '../adapters/needReadinessAdapter'

export type QuestStage =
  | 'orientation'
  | 'dialogue'
  | 'casebuilder'
  | 'decision'
  | 'complete'

export interface QuestState {
  stage: QuestStage
  dialogueIndex: number
  needDescription: string
  audienceId: AudienceId | null
  selectedDecisionId: DecisionId | null
  feedback: string | null
  unsuccessfulAttempts: number
}

export type QuestEvent =
  | { type: 'START_DIALOGUE' }
  | { type: 'ADVANCE_DIALOGUE' }
  | {
      type: 'SUBMIT_NEED'
      needDescription: string
      audienceId: AudienceId | null
    }
  | { type: 'CHOOSE_DECISION'; decisionId: DecisionId }
  | { type: 'RESET' }

export const initialQuestState: QuestState = {
  stage: 'orientation',
  dialogueIndex: 0,
  needDescription: '',
  audienceId: null,
  selectedDecisionId: null,
  feedback: null,
  unsuccessfulAttempts: 0,
}

export function questReducer(
  state: QuestState,
  event: QuestEvent,
): QuestState {
  switch (event.type) {
    case 'START_DIALOGUE':
      if (state.stage !== 'orientation') return state
      return { ...state, stage: 'dialogue', feedback: null }

    case 'ADVANCE_DIALOGUE': {
      if (state.stage !== 'dialogue') return state
      const lastIndex = verticalSlice.npc.dialogue.length - 1
      if (state.dialogueIndex >= lastIndex) {
        return { ...state, stage: 'casebuilder', feedback: null }
      }
      return { ...state, dialogueIndex: state.dialogueIndex + 1 }
    }

    case 'SUBMIT_NEED': {
      if (state.stage !== 'casebuilder') return state
      const result = evaluateNeedReadiness(event)

      if (!result.ready) {
        return {
          ...state,
          needDescription: result.normalizedNeed,
          audienceId: event.audienceId,
          feedback: result.reason,
        }
      }

      return {
        ...state,
        stage: 'decision',
        needDescription: result.normalizedNeed,
        audienceId: result.audienceId,
        feedback:
          'Behov og målgruppe er registrert. Avhengighetsporten er klar for beslutningen.',
      }
    }

    case 'CHOOSE_DECISION': {
      if (state.stage !== 'decision') return state
      const decision = verticalSlice.decisions.find(
        (candidate) => candidate.id === event.decisionId,
      )
      if (!decision) return state

      return {
        ...state,
        stage: decision.completesGate ? 'complete' : 'decision',
        selectedDecisionId: decision.id,
        feedback: decision.consequence,
        unsuccessfulAttempts:
          state.unsuccessfulAttempts + (decision.completesGate ? 0 : 1),
      }
    }

    case 'RESET':
      return initialQuestState
  }
}
