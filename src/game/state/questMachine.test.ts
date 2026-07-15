import {
  initialQuestState,
  MINIMUM_NEED_LENGTH,
  questReducer,
} from './questMachine'

function reachCasebuilder() {
  let state = questReducer(initialQuestState, { type: 'START_DIALOGUE' })
  state = questReducer(state, { type: 'ADVANCE_DIALOGUE' })
  state = questReducer(state, { type: 'ADVANCE_DIALOGUE' })
  return questReducer(state, { type: 'ADVANCE_DIALOGUE' })
}

describe('questMachine', () => {
  it('requires the dialogue before opening Casebuilder', () => {
    const state = questReducer(initialQuestState, {
      type: 'SUBMIT_NEED',
      needDescription: 'Et fullstendig behov som ellers ville vært gyldig.',
      audienceId: 'citizen',
    })

    expect(state).toEqual(initialQuestState)
  })

  it('keeps the dependency gate closed for an incomplete need', () => {
    const state = questReducer(reachCasebuilder(), {
      type: 'SUBMIT_NEED',
      needDescription: 'For kort',
      audienceId: 'citizen',
    })

    expect(state.stage).toBe('casebuilder')
    expect(state.feedback).toContain(String(MINIMUM_NEED_LENGTH))
  })

  it('shows a consequence without completing an unsafe shortcut', () => {
    const decisionState = questReducer(reachCasebuilder(), {
      type: 'SUBMIT_NEED',
      needDescription:
        'Innbyggeren trenger tydelig hjelp til å forberede seg til avtalen.',
      audienceId: 'citizen',
    })
    const state = questReducer(decisionState, {
      type: 'CHOOSE_DECISION',
      decisionId: 'choose-connection',
    })

    expect(state.stage).toBe('decision')
    expect(state.unsuccessfulAttempts).toBe(1)
    expect(state.feedback).toContain('Porten forblir stengt')
  })

  it('completes the slice only after need, audience and safe decision', () => {
    const decisionState = questReducer(reachCasebuilder(), {
      type: 'SUBMIT_NEED',
      needDescription:
        'Innbyggeren trenger tydelig hjelp til å forberede seg til avtalen.',
      audienceId: 'citizen',
    })
    const state = questReducer(decisionState, {
      type: 'CHOOSE_DECISION',
      decisionId: 'clarify-need',
    })

    expect(state.stage).toBe('complete')
    expect(state.feedback).toContain('Porten åpner seg')
  })
})
