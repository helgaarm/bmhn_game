import { describe, expect, it } from 'vitest'
import { buildConnectRuleEvidence, connectReducer, initialConnectState, type ConnectEvent } from './connectMachine'

function completeProfessionalRoute() {
  const events: ConnectEvent[] = [
    { type: 'BEGIN' },
    { type: 'ADVANCE_DIALOGUE' },
    { type: 'ADVANCE_DIALOGUE' },
    { type: 'ADVANCE_DIALOGUE' },
    { type: 'SELECT_SERVICE', serviceId: 'professional-fhir' },
    { type: 'SELECT_ROUTE', routeId: 'helseid-fhir-test' },
    { type: 'SET_RATIONALE', value: 'Tjenestekortet navngir helsepersonell, HelseID i test og FHIR R4.' },
    { type: 'SUBMIT_ROUTE' },
    { type: 'CHOOSE_DECISION', decisionId: 'record-learning-evidence' },
  ]
  return events.reduce(connectReducer, initialConnectState)
}

describe('Connect quest', () => {
  it('rejects a connection that is not advertised by the service card', () => {
    const state = [
      { type: 'BEGIN' },
      { type: 'ADVANCE_DIALOGUE' },
      { type: 'ADVANCE_DIALOGUE' },
      { type: 'ADVANCE_DIALOGUE' },
      { type: 'SELECT_SERVICE', serviceId: 'citizen-dialogue' },
      { type: 'SELECT_ROUTE', routeId: 'browser-secret' },
      { type: 'SET_RATIONALE', value: 'Vi antar SMART selv om kortet ikke dokumenterer noen slik kapasitet.' },
      { type: 'SUBMIT_ROUTE' },
    ] as ConnectEvent[]
    const result = state.reduce(connectReducer, initialConnectState)
    expect(result.stage).toBe('route-map')
    expect(result.unsuccessfulAttempts).toBe(1)
  })

  it('completes a documented route and produces all conditional rule evidence', () => {
    const result = completeProfessionalRoute()
    expect(result.stage).toBe('complete')
    const evidence = buildConnectRuleEvidence(result)
    expect(evidence).toHaveLength(5)
    expect(evidence.find((item) => item.ruleId === 'cn-smart-launch')?.outcome).toBe('not-applicable')
    expect(evidence.every((item) => item.evidence.length > 0)).toBe(true)
  })
})
