import { describe, expect, it } from 'vitest'
import { productionApprovalState } from './productionApprovalState'
import { evaluateProductionReadiness } from './productionReadiness'
import { productionRuleRegistry } from './productionRules'

describe('production approval gate', () => {
  it('fails a production release until current evidence and named approvals exist', () => {
    const productionGate = (
      globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> }
      }
    ).process?.env?.PRODUCTION_APPROVAL_GATE
    const result = evaluateProductionReadiness(
      productionRuleRegistry,
      productionApprovalState.assessments,
      productionApprovalState.approvals,
    )

    if (productionGate === '1') {
      expect(
        result.ready,
        result.blockers.map((blocker) => blocker.message).join('\n'),
      ).toBe(true)
      return
    }

    expect(result.ready).toBe(false)
  })
})
