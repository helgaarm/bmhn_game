import { firstCampaign } from '../content/firstCampaign'
import { understandAssess } from '../content/understandAssess'
import { verticalSlice, type AudienceId } from '../content/verticalSlice'
import type { AssessmentState } from '../state/assessmentMachine'
import type { CampaignState } from '../state/campaignMachine'
import type { QuestState } from '../state/questMachine'

export const GAME_SAVE_KEY = 'bmhn.game.save'
export const GAME_SAVE_SCHEMA_VERSION = 1

export interface GameSaveDraft {
  needDescription: string
  audienceId: AudienceId | null
}

export interface GameSaveState {
  quest: QuestState
  assessment: AssessmentState
  campaign: CampaignState
  draft: GameSaveDraft
}

export interface GameSaveEnvelope extends GameSaveState {
  schemaVersion: number
  campaignId: string
  campaignContentVersion: number
  savedAt: string
}

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type GameSaveLoadResult =
  | { status: 'empty' }
  | { status: 'restored'; save: GameSaveEnvelope }
  | { status: 'recovered'; reason: 'invalid-json' | 'invalid-shape' }
  | {
      status: 'incompatible'
      reason: 'unsupported-schema' | 'campaign-content-version'
    }
  | { status: 'unavailable' }

export type GameSaveWriteResult =
  | { status: 'saved'; savedAt: string }
  | { status: 'unavailable' }

const questStages = new Set([
  'orientation',
  'dialogue',
  'casebuilder',
  'decision',
  'complete',
])
const assessmentStages = new Set([
  'locked',
  'dialogue',
  'actor-map',
  'gate',
  'complete',
])
const campaignStatuses = new Set([
  'unavailable',
  'available',
  'active',
  'blocked',
  'ready',
  'completed',
  'failed-with-learning',
])
const audienceIds = new Set<string>(verticalSlice.audiences.map((item) => item.id))
const questDecisionIds = new Set<string>(verticalSlice.decisions.map((item) => item.id))
const assessmentActorIds = new Set<string>(
  understandAssess.actors.map((item) => item.id),
)
const assessmentDecisionIds = new Set<string>(
  understandAssess.decisions.map((item) => item.id),
)
const campaignStageIds = new Set<string>(firstCampaign.stages.map((stage) => stage.id))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isAudienceId(value: unknown): value is AudienceId {
  return typeof value === 'string' && audienceIds.has(value as AudienceId)
}

function isQuestState(value: unknown): value is QuestState {
  if (!isRecord(value)) return false
  return (
    questStages.has(String(value.stage)) &&
    isNonNegativeInteger(value.dialogueIndex) &&
    isString(value.needDescription) &&
    (value.audienceId === null || isAudienceId(value.audienceId)) &&
    (value.selectedDecisionId === null ||
      (typeof value.selectedDecisionId === 'string' &&
        questDecisionIds.has(value.selectedDecisionId))) &&
    isNullableString(value.feedback) &&
    isNonNegativeInteger(value.unsuccessfulAttempts)
  )
}

function isAssessmentState(value: unknown): value is AssessmentState {
  if (!isRecord(value) || !Array.isArray(value.selectedActorIds)) return false
  const selectedActorIds = value.selectedActorIds
  return (
    assessmentStages.has(String(value.stage)) &&
    isNonNegativeInteger(value.dialogueIndex) &&
    (value.requiredActorId === null ||
      (typeof value.requiredActorId === 'string' &&
        assessmentActorIds.has(value.requiredActorId))) &&
    selectedActorIds.every(
      (actorId) =>
        typeof actorId === 'string' && assessmentActorIds.has(actorId),
    ) &&
    new Set(selectedActorIds).size === selectedActorIds.length &&
    isString(value.expectedValue) &&
    isString(value.uncertainty) &&
    (value.selectedDecisionId === null ||
      (typeof value.selectedDecisionId === 'string' &&
        assessmentDecisionIds.has(value.selectedDecisionId))) &&
    isNullableString(value.feedback) &&
    isNonNegativeInteger(value.unsuccessfulAttempts)
  )
}

function isCampaignState(value: unknown): value is CampaignState {
  if (!isRecord(value) || !Array.isArray(value.stages)) return false
  if (!Array.isArray(value.decisions)) return false

  const stagesAreValid =
    value.stages.length === firstCampaign.stages.length &&
    value.stages.every((stage, index) => {
      if (!isRecord(stage)) return false
      return (
        stage.id === firstCampaign.stages[index].id &&
        campaignStatuses.has(String(stage.status)) &&
        isStringArray(stage.evidence) &&
        isNullableString(stage.blocker)
      )
    })
  const decisionsAreValid = value.decisions.every((decision) => {
    if (!isRecord(decision)) return false
    return (
      isString(decision.id) &&
      typeof decision.stageId === 'string' &&
      campaignStageIds.has(decision.stageId) &&
      isString(decision.choice) &&
      isString(decision.rationale) &&
      isString(decision.role) &&
      isString(decision.sourceId) &&
      isString(decision.consequence)
    )
  })

  return (
    value.campaignId === firstCampaign.id &&
    value.contentVersion === firstCampaign.version &&
    stagesAreValid &&
    decisionsAreValid
  )
}

function isGameSaveEnvelope(value: unknown): value is GameSaveEnvelope {
  if (!isRecord(value) || !isRecord(value.draft)) return false
  return (
    value.schemaVersion === GAME_SAVE_SCHEMA_VERSION &&
    value.campaignId === firstCampaign.id &&
    value.campaignContentVersion === firstCampaign.version &&
    isString(value.savedAt) &&
    !Number.isNaN(Date.parse(value.savedAt)) &&
    isQuestState(value.quest) &&
    isAssessmentState(value.assessment) &&
    isCampaignState(value.campaign) &&
    isString(value.draft.needDescription) &&
    (value.draft.audienceId === null || isAudienceId(value.draft.audienceId))
  )
}

function removeInvalidSave(storage: StorageLike) {
  try {
    storage.removeItem(GAME_SAVE_KEY)
  } catch {
    // The caller still receives a recovery result; no second storage mutation is safe.
  }
}

export function loadGameSave(storage: StorageLike): GameSaveLoadResult {
  let raw: string | null
  try {
    raw = storage.getItem(GAME_SAVE_KEY)
  } catch {
    return { status: 'unavailable' }
  }
  if (raw === null) return { status: 'empty' }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    removeInvalidSave(storage)
    return { status: 'recovered', reason: 'invalid-json' }
  }
  if (!isRecord(parsed)) {
    removeInvalidSave(storage)
    return { status: 'recovered', reason: 'invalid-shape' }
  }

  if (parsed.schemaVersion !== GAME_SAVE_SCHEMA_VERSION) {
    return { status: 'incompatible', reason: 'unsupported-schema' }
  }
  if (
    parsed.campaignId !== firstCampaign.id ||
    parsed.campaignContentVersion !== firstCampaign.version
  ) {
    return { status: 'incompatible', reason: 'campaign-content-version' }
  }
  if (!isGameSaveEnvelope(parsed)) {
    removeInvalidSave(storage)
    return { status: 'recovered', reason: 'invalid-shape' }
  }

  return { status: 'restored', save: parsed }
}

export function writeGameSave(
  storage: StorageLike,
  state: GameSaveState,
  now: () => Date = () => new Date(),
): GameSaveWriteResult {
  const savedAt = now().toISOString()
  const envelope: GameSaveEnvelope = {
    schemaVersion: GAME_SAVE_SCHEMA_VERSION,
    campaignId: firstCampaign.id,
    campaignContentVersion: firstCampaign.version,
    savedAt,
    ...state,
  }

  try {
    storage.setItem(GAME_SAVE_KEY, JSON.stringify(envelope))
    return { status: 'saved', savedAt }
  } catch {
    return { status: 'unavailable' }
  }
}

export function clearGameSave(storage: StorageLike): boolean {
  try {
    storage.removeItem(GAME_SAVE_KEY)
    return true
  } catch {
    return false
  }
}
