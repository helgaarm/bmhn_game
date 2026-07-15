import type {
  CampaignDefinition,
  JourneyStageId,
} from '../content/campaignSchema'

export type CampaignStageStatus =
  | 'unavailable'
  | 'available'
  | 'active'
  | 'blocked'
  | 'ready'
  | 'completed'
  | 'failed-with-learning'

export interface CampaignStageState {
  id: JourneyStageId
  status: CampaignStageStatus
  evidence: string[]
  blocker: string | null
}

export interface DecisionRecord {
  id: string
  stageId: JourneyStageId
  choice: string
  rationale: string
  role: string
  sourceId: string
  consequence: string
}

export interface CampaignState {
  campaignId: string
  contentVersion: number
  stages: CampaignStageState[]
  decisions: DecisionRecord[]
}

export type CampaignEvent =
  | {
      type: 'MARK_READY'
      stageId: JourneyStageId
      evidence: string[]
    }
  | {
      type: 'BLOCK_STAGE'
      stageId: JourneyStageId
      reason: string
    }
  | {
      type: 'COMPLETE_STAGE'
      stageId: JourneyStageId
      evidence: string[]
      decision?: DecisionRecord
    }
  | { type: 'RESET' }

export function createCampaignState(
  campaign: CampaignDefinition,
): CampaignState {
  return {
    campaignId: campaign.id,
    contentVersion: campaign.version,
    stages: campaign.stages.map((stage, index) => ({
      id: stage.id,
      status: index === 0 ? 'active' : 'unavailable',
      evidence: [],
      blocker: null,
    })),
    decisions: [],
  }
}

function updateStage(
  state: CampaignState,
  stageId: JourneyStageId,
  update: (stage: CampaignStageState) => CampaignStageState,
): CampaignState {
  return {
    ...state,
    stages: state.stages.map((stage) =>
      stage.id === stageId ? update(stage) : stage,
    ),
  }
}

export function createCampaignReducer(campaign: CampaignDefinition) {
  const initialState = createCampaignState(campaign)

  return function campaignReducer(
    state: CampaignState,
    event: CampaignEvent,
  ): CampaignState {
    switch (event.type) {
      case 'MARK_READY':
        return updateStage(state, event.stageId, (stage) => {
          if (!['active', 'blocked'].includes(stage.status)) return stage
          return {
            ...stage,
            status: 'ready',
            evidence: [...event.evidence],
            blocker: null,
          }
        })

      case 'BLOCK_STAGE':
        return updateStage(state, event.stageId, (stage) => {
          if (!['active', 'ready'].includes(stage.status)) return stage
          return { ...stage, status: 'blocked', blocker: event.reason }
        })

      case 'COMPLETE_STAGE': {
        const currentIndex = state.stages.findIndex(
          (stage) => stage.id === event.stageId,
        )
        const current = state.stages[currentIndex]
        if (!current || current.status === 'completed') return state
        if (!['active', 'ready', 'failed-with-learning'].includes(current.status)) {
          return state
        }

        const nextId = campaign.stages[currentIndex]?.nextStageId
        const decisionExists = event.decision
          ? state.decisions.some((decision) => decision.id === event.decision?.id)
          : false

        return {
          ...state,
          stages: state.stages.map((stage) => {
            if (stage.id === event.stageId) {
              return {
                ...stage,
                status: 'completed',
                evidence: [...event.evidence],
                blocker: null,
              }
            }
            if (nextId && stage.id === nextId && stage.status === 'unavailable') {
              return { ...stage, status: 'active' }
            }
            return stage
          }),
          decisions:
            event.decision && !decisionExists
              ? [...state.decisions, event.decision]
              : state.decisions,
        }
      }

      case 'RESET':
        return initialState
    }
  }
}
