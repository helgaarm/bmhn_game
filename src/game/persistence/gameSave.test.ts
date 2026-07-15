import { firstCampaign } from '../content/firstCampaign'
import { initialAssessmentState } from '../state/assessmentMachine'
import { createCampaignState } from '../state/campaignMachine'
import { initialClarifyOrderState } from '../state/clarifyOrderMachine'
import { initialConnectState } from '../state/connectMachine'
import { initialQuestState } from '../state/questMachine'
import {
  GAME_SAVE_KEY,
  clearGameSave,
  loadGameSave,
  writeGameSave,
  type GameSaveState,
  type StorageLike,
} from './gameSave'

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>()

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }
}

const state: GameSaveState = {
  quest: initialQuestState,
  assessment: initialAssessmentState,
  clarifyOrder: initialClarifyOrderState,
  connect: initialConnectState,
  campaign: createCampaignState(firstCampaign),
  draft: {
    needDescription: 'Et syntetisk utkast til behov.',
    audienceId: 'citizen',
  },
}

describe('gameSave', () => {
  it('round-trips a versioned save envelope', () => {
    const storage = new MemoryStorage()
    const written = writeGameSave(
      storage,
      state,
      () => new Date('2026-07-15T12:00:00.000Z'),
    )
    const loaded = loadGameSave(storage)

    expect(written).toEqual({
      status: 'saved',
      savedAt: '2026-07-15T12:00:00.000Z',
    })
    expect(loaded.status).toBe('restored')
    if (loaded.status === 'restored') {
      expect(loaded.save.draft).toEqual(state.draft)
      expect(loaded.save.campaignContentVersion).toBe(firstCampaign.version)
    }
  })

  it('removes corrupt JSON and recovers with a fresh state', () => {
    const storage = new MemoryStorage()
    storage.setItem(GAME_SAVE_KEY, '{not-json')

    expect(loadGameSave(storage)).toEqual({
      status: 'recovered',
      reason: 'invalid-json',
    })
    expect(storage.getItem(GAME_SAVE_KEY)).toBeNull()
  })

  it('migrates a valid schema-1 save with an initial Clarify and order state', () => {
    const storage = new MemoryStorage()
    writeGameSave(storage, state)
    const legacy = JSON.parse(storage.getItem(GAME_SAVE_KEY) ?? '{}')
    legacy.schemaVersion = 1
    delete legacy.clarifyOrder
    delete legacy.connect
    storage.setItem(GAME_SAVE_KEY, JSON.stringify(legacy))

    const loaded = loadGameSave(storage)

    expect(loaded.status).toBe('restored')
    if (loaded.status === 'restored') {
      expect(loaded.save.schemaVersion).toBe(3)
      expect(loaded.save.clarifyOrder).toEqual(initialClarifyOrderState)
      expect(loaded.save.connect).toEqual(initialConnectState)
    }
  })

  it('migrates a valid schema-2 save with an initial Connect state', () => {
    const storage = new MemoryStorage()
    writeGameSave(storage, state)
    const legacy = JSON.parse(storage.getItem(GAME_SAVE_KEY) ?? '{}')
    legacy.schemaVersion = 2
    delete legacy.connect
    storage.setItem(GAME_SAVE_KEY, JSON.stringify(legacy))

    const loaded = loadGameSave(storage)

    expect(loaded.status).toBe('restored')
    if (loaded.status === 'restored') {
      expect(loaded.save.schemaVersion).toBe(3)
      expect(loaded.save.connect).toEqual(initialConnectState)
    }
  })

  it('rejects an invalid state shape and removes it', () => {
    const storage = new MemoryStorage()
    writeGameSave(storage, state)
    const parsed = JSON.parse(storage.getItem(GAME_SAVE_KEY) ?? '{}')
    parsed.quest.stage = 'teleported-past-the-gate'
    storage.setItem(GAME_SAVE_KEY, JSON.stringify(parsed))

    expect(loadGameSave(storage)).toEqual({
      status: 'recovered',
      reason: 'invalid-shape',
    })
    expect(storage.getItem(GAME_SAVE_KEY)).toBeNull()
  })

  it('preserves an unknown newer schema instead of overwriting it', () => {
    const storage = new MemoryStorage()
    writeGameSave(storage, state)
    const parsed = JSON.parse(storage.getItem(GAME_SAVE_KEY) ?? '{}')
    parsed.schemaVersion = 99
    const futureSave = JSON.stringify(parsed)
    storage.setItem(GAME_SAVE_KEY, futureSave)

    expect(loadGameSave(storage)).toEqual({
      status: 'incompatible',
      reason: 'unsupported-schema',
    })
    expect(storage.getItem(GAME_SAVE_KEY)).toBe(futureSave)
  })

  it('preserves a save from another campaign content version', () => {
    const storage = new MemoryStorage()
    writeGameSave(storage, state)
    const parsed = JSON.parse(storage.getItem(GAME_SAVE_KEY) ?? '{}')
    parsed.campaignContentVersion = firstCampaign.version + 1
    const futureSave = JSON.stringify(parsed)
    storage.setItem(GAME_SAVE_KEY, futureSave)

    expect(loadGameSave(storage)).toEqual({
      status: 'incompatible',
      reason: 'campaign-content-version',
    })
    expect(storage.getItem(GAME_SAVE_KEY)).toBe(futureSave)
  })

  it('reports unavailable storage without failing the game', () => {
    const unavailable: StorageLike = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }

    expect(loadGameSave(unavailable)).toEqual({ status: 'unavailable' })
    expect(writeGameSave(unavailable, state)).toEqual({ status: 'unavailable' })
    expect(clearGameSave(unavailable)).toBe(false)
  })
})
