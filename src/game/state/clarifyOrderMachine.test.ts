import { describe, expect, it } from 'vitest'
import {
  buildClarifyRuleEvidence,
  clarifyOrderReducer,
  initialClarifyOrderState,
  type ClarifyOrderEvent,
} from './clarifyOrderMachine'

const validEvents: ClarifyOrderEvent[] = [
  { type: 'BEGIN' },
  { type: 'ADVANCE_DIALOGUE' },
  { type: 'ADVANCE_DIALOGUE' },
  { type: 'ADVANCE_DIALOGUE' },
  {
    type: 'SET_PURPOSE_SCOPE',
    value: 'Avgrenset formål for syntetisk dialogforberedelse uten teknologivalg.',
  },
  {
    type: 'SET_INFORMATION_FLOW',
    value: 'Innbygger gir opplysninger til kommunen; returen er en oppsummering.',
  },
  {
    type: 'SET_SERVICE_DOCUMENTATION',
    value: 'Helsenorge-tjeneste må navngis og dokumentasjon bekreftes av tjenesteeier.',
  },
  {
    type: 'ASSIGN_OWNER',
    workstreamId: 'purpose-and-privacy',
    roleId: 'privacy-legal',
  },
  {
    type: 'ASSIGN_OWNER',
    workstreamId: 'risk-and-dpia',
    roleId: 'security-privacy',
  },
  {
    type: 'ASSIGN_OWNER',
    workstreamId: 'service-readiness',
    roleId: 'product-integration',
  },
  { type: 'SET_RISK_DISPOSITION', value: 'screen-and-assess' },
  { type: 'SUBMIT_ORDER_SHEET' },
]

function createGateState() {
  return validEvents.reduce(clarifyOrderReducer, initialClarifyOrderState)
}

describe('clarifyOrderMachine', () => {
  it('requires dialogue before the order sheet', () => {
    const afterBegin = clarifyOrderReducer(initialClarifyOrderState, {
      type: 'BEGIN',
    })

    expect(afterBegin.stage).toBe('dialogue')
    expect(
      [1, 2, 3].reduce(
        (state) => clarifyOrderReducer(state, { type: 'ADVANCE_DIALOGUE' }),
        afterBegin,
      ).stage,
    ).toBe('order-sheet')
  })

  it('blocks incomplete or incorrectly owned work', () => {
    const orderSheet = validEvents.slice(0, 4).reduce(
      clarifyOrderReducer,
      initialClarifyOrderState,
    )
    const missingScope = clarifyOrderReducer(orderSheet, {
      type: 'SUBMIT_ORDER_SHEET',
    })

    expect(missingScope.stage).toBe('order-sheet')
    expect(missingScope.feedback).toContain('Formål og omfang')

    const wrongOwnerEvents = validEvents.map((event) =>
      event.type === 'ASSIGN_OWNER' && event.workstreamId === 'risk-and-dpia'
        ? ({ ...event, roleId: 'need-owner' } as ClarifyOrderEvent)
        : event,
    )
    const wrongOwner = wrongOwnerEvents.reduce(
      clarifyOrderReducer,
      initialClarifyOrderState,
    )

    expect(wrongOwner.stage).toBe('order-sheet')
    expect(wrongOwner.feedback).toContain('nødvendige faglige vurderingen')
  })

  it('keeps the gate closed for false approval and technology-first choices', () => {
    const gate = createGateState()
    const falseApproval = clarifyOrderReducer(gate, {
      type: 'CHOOSE_DECISION',
      decisionId: 'approve-from-prototype',
    })
    const technologyFirst = clarifyOrderReducer(falseApproval, {
      type: 'CHOOSE_DECISION',
      decisionId: 'choose-technology-now',
    })

    expect(gate.stage).toBe('gate')
    expect(falseApproval.stage).toBe('gate')
    expect(technologyFirst.stage).toBe('gate')
    expect(technologyFirst.unsuccessfulAttempts).toBe(2)
  })

  it('completes with three structured rule-evidence records and pending approvals', () => {
    const complete = clarifyOrderReducer(createGateState(), {
      type: 'CHOOSE_DECISION',
      decisionId: 'request-professional-review',
    })
    const evidence = buildClarifyRuleEvidence(
      complete,
      'Innbyggeren trenger bedre dialogforberedelse.',
      'Innbygger, behandler og behovseier',
    )

    expect(complete.stage).toBe('complete')
    expect(evidence.map((item) => item.ruleId)).toEqual([
      'co-purpose-legal-basis',
      'co-risk-dpia',
      'co-need-before-connection',
    ])
    expect(
      evidence.flatMap((item) => item.evidence).join(' '),
    ).toContain('avventer')
  })

  it('replays deterministically', () => {
    const replay = () =>
      validEvents.reduce(clarifyOrderReducer, initialClarifyOrderState)
    expect(replay()).toEqual(replay())
  })
})
