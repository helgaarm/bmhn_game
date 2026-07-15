import { describe, expect, it } from 'vitest'
import { firstCampaign } from '../content/firstCampaign'
import { productionRuleRegistry } from '../compliance/productionRules'
import {
  createCampaignReducer,
  createCampaignState,
  type CampaignEvent,
} from './campaignMachine'

const reducer = createCampaignReducer(firstCampaign)

const discoverDecision = {
  id: 'discover-clarify-need',
  stageId: 'discover' as const,
  choice: 'Avklar behov og målgruppe',
  rationale: 'Scenarioet må styre veien videre.',
  role: 'Tjenesteteam',
  sourceId: 'strategy-journey',
  consequence: 'Porten åpner seg.',
}

describe('campaignMachine', () => {
  it('starts only the first journey stage', () => {
    const state = createCampaignState(firstCampaign)

    expect(state.stages[0].status).toBe('active')
    expect(state.stages.slice(1).every((stage) => stage.status === 'unavailable')).toBe(true)
  })

  it('completes Discover, activates the next stage and records a decision once', () => {
    const event: CampaignEvent = {
      type: 'COMPLETE_STAGE',
      stageId: 'discover',
      evidence: ['Behovsbeskrivelse', 'Primær målgruppe'],
      decision: discoverDecision,
    }
    const once = reducer(createCampaignState(firstCampaign), event)
    const replayed = reducer(once, event)

    expect(replayed.stages[0].status).toBe('completed')
    expect(replayed.stages[1].status).toBe('active')
    expect(replayed.decisions).toEqual([discoverDecision])
  })

  it('does not allow an unavailable stage to complete out of order', () => {
    const state = reducer(createCampaignState(firstCampaign), {
      type: 'COMPLETE_STAGE',
      stageId: 'connect',
      evidence: ['Prematurt bevis'],
    })

    expect(state.stages.find((stage) => stage.id === 'connect')?.status).toBe(
      'unavailable',
    )
  })

  it('records assessment evidence and activates Clarify and order', () => {
    const afterDiscover = reducer(createCampaignState(firstCampaign), {
      type: 'COMPLETE_STAGE',
      stageId: 'discover',
      evidence: ['Behovsbeskrivelse', 'Primær målgruppe'],
      decision: discoverDecision,
    })
    const state = reducer(afterDiscover, {
      type: 'COMPLETE_STAGE',
      stageId: 'understand-assess',
      evidence: [
        'Aktørbilde: Innbygger, Behandler, Tjenesteeier',
        'Forventet verdi: Et forståelig resultat',
        'Åpen usikkerhet: Et spørsmål som må undersøkes',
      ],
      decision: {
        id: 'understand-assess-carry-uncertainty',
        stageId: 'understand-assess',
        choice: 'Behold usikkerheten synlig',
        rationale: 'Åpne spørsmål må undersøkes.',
        role: 'Behovseier',
        sourceId: 'strategy-journey',
        consequence: 'Porten åpner seg.',
      },
    })

    expect(state.stages[1].status).toBe('completed')
    expect(state.stages[1].evidence).toHaveLength(3)
    expect(state.stages[2].status).toBe('active')
    expect(state.decisions).toHaveLength(2)
  })

  it('replays a deterministic event sequence', () => {
    const events: CampaignEvent[] = [
      {
        type: 'MARK_READY',
        stageId: 'discover',
        evidence: ['Behovsbeskrivelse', 'Primær målgruppe'],
      },
      {
        type: 'COMPLETE_STAGE',
        stageId: 'discover',
        evidence: ['Behovsbeskrivelse', 'Primær målgruppe'],
        decision: discoverDecision,
      },
    ]
    const replay = () =>
      events.reduce(reducer, createCampaignState(firstCampaign))

    expect(replay()).toEqual(replay())
  })

  it('blocks a governed stage until every required rule has structured evidence', () => {
    const afterDiscover = reducer(createCampaignState(firstCampaign), {
      type: 'COMPLETE_STAGE',
      stageId: 'discover',
      evidence: ['Behovsbeskrivelse', 'Primær målgruppe'],
      decision: discoverDecision,
    })
    const afterAssessment = reducer(afterDiscover, {
      type: 'COMPLETE_STAGE',
      stageId: 'understand-assess',
      evidence: ['Aktørbilde', 'Forventet verdi', 'Åpen usikkerhet'],
    })
    const blocked = reducer(afterAssessment, {
      type: 'COMPLETE_STAGE',
      stageId: 'clarify-order',
      evidence: ['Avklart omfang'],
    })

    expect(
      blocked.stages.find((stage) => stage.id === 'clarify-order'),
    ).toMatchObject({ status: 'blocked' })

    const clarifyRules = productionRuleRegistry.rules.filter((rule) =>
      rule.stageIds.includes('clarify-order'),
    )
    const completed = reducer(blocked, {
      type: 'COMPLETE_STAGE',
      stageId: 'clarify-order',
      evidence: ['Avklart omfang'],
      ruleEvidence: clarifyRules.map((rule) => ({
        ruleId: rule.id,
        outcome: 'satisfied' as const,
        rationale: 'Syntetisk scenarioevidens er dokumentert for læringsporten.',
        evidence: [`Kontrollert evidens for ${rule.id}`],
      })),
    })

    expect(
      completed.stages.find((stage) => stage.id === 'clarify-order'),
    ).toMatchObject({ status: 'completed' })
    expect(completed.stages.find((stage) => stage.id === 'connect')?.status).toBe(
      'active',
    )
  })
})
