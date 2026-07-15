import { understandAssess } from '../content/understandAssess'
import {
  assessmentReducer,
  initialAssessmentState,
  MINIMUM_ACTOR_COUNT,
  MINIMUM_ASSESSMENT_TEXT_LENGTH,
} from './assessmentMachine'

function reachActorMap() {
  let state = assessmentReducer(initialAssessmentState, {
    type: 'BEGIN',
    requiredActorId: 'citizen',
  })
  for (let index = 0; index < understandAssess.npc.dialogue.length; index += 1) {
    state = assessmentReducer(state, { type: 'ADVANCE_DIALOGUE' })
  }
  return state
}

function validMapping() {
  let state = reachActorMap()
  state = assessmentReducer(state, { type: 'TOGGLE_ACTOR', actorId: 'clinician' })
  state = assessmentReducer(state, { type: 'TOGGLE_ACTOR', actorId: 'service-owner' })
  state = assessmentReducer(state, {
    type: 'SET_EXPECTED_VALUE',
    value: 'Innbyggeren møter bedre forberedt og forstår hva som skal skje.',
  })
  return assessmentReducer(state, {
    type: 'SET_UNCERTAINTY',
    value: 'Laget vet ikke hvilke grupper som trenger en alternativ støttevei.',
  })
}

describe('assessmentMachine', () => {
  it('stays locked until the previous stage supplies its primary actor', () => {
    const unchanged = assessmentReducer(initialAssessmentState, {
      type: 'ADVANCE_DIALOGUE',
    })
    const started = assessmentReducer(initialAssessmentState, {
      type: 'BEGIN',
      requiredActorId: 'clinician',
    })

    expect(unchanged).toEqual(initialAssessmentState)
    expect(started.stage).toBe('dialogue')
    expect(started.selectedActorIds).toEqual(['clinician'])
  })

  it('keeps the required actor selected', () => {
    const state = assessmentReducer(reachActorMap(), {
      type: 'TOGGLE_ACTOR',
      actorId: 'citizen',
    })

    expect(state.selectedActorIds).toContain('citizen')
    expect(state.feedback).toContain('må være med')
  })

  it('requires an actor map with value and uncertainty evidence', () => {
    const tooFewActors = assessmentReducer(reachActorMap(), {
      type: 'SUBMIT_MAPPING',
    })

    expect(tooFewActors.stage).toBe('actor-map')
    expect(tooFewActors.feedback).toContain(String(MINIMUM_ACTOR_COUNT))

    let shortValue = reachActorMap()
    shortValue = assessmentReducer(shortValue, { type: 'TOGGLE_ACTOR', actorId: 'clinician' })
    shortValue = assessmentReducer(shortValue, { type: 'TOGGLE_ACTOR', actorId: 'service-owner' })
    shortValue = assessmentReducer(shortValue, { type: 'SET_EXPECTED_VALUE', value: 'For kort' })
    shortValue = assessmentReducer(shortValue, {
      type: 'SET_UNCERTAINTY',
      value: 'Dette er en lang nok beskrivelse av en åpen usikkerhet.',
    })
    shortValue = assessmentReducer(shortValue, { type: 'SUBMIT_MAPPING' })

    expect(shortValue.feedback).toContain(String(MINIMUM_ASSESSMENT_TEXT_LENGTH))
  })

  it('shows a consequence without opening the gate for hidden uncertainty', () => {
    const gate = assessmentReducer(validMapping(), { type: 'SUBMIT_MAPPING' })
    const state = assessmentReducer(gate, {
      type: 'CHOOSE_DECISION',
      decisionId: 'hide-uncertainty',
    })

    expect(state.stage).toBe('gate')
    expect(state.unsuccessfulAttempts).toBe(1)
    expect(state.feedback).toContain('Porten forblir stengt')
  })

  it('completes only with actors, value, uncertainty and a responsible next step', () => {
    const gate = assessmentReducer(validMapping(), { type: 'SUBMIT_MAPPING' })
    const complete = assessmentReducer(gate, {
      type: 'CHOOSE_DECISION',
      decisionId: 'carry-uncertainty-forward',
    })

    expect(complete.stage).toBe('complete')
    expect(complete.selectedActorIds).toHaveLength(3)
    expect(complete.feedback).toContain('Porten åpner seg')
  })

  it('replays the same event sequence deterministically', () => {
    const events = [
      { type: 'BEGIN', requiredActorId: 'citizen' },
      { type: 'ADVANCE_DIALOGUE' },
      { type: 'ADVANCE_DIALOGUE' },
      { type: 'ADVANCE_DIALOGUE' },
    ] as const
    const replay = () => events.reduce(assessmentReducer, initialAssessmentState)

    expect(replay()).toEqual(replay())
  })
})
