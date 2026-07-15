import { describe, expect, it } from 'vitest'
import { evaluateProductionReadiness } from './productionReadiness'
import { productionRuleRegistrySchema } from './productionRuleSchema'
import { productionRuleRegistry } from './productionRules'
import { productionReadinessFixture } from './productionRules.testFixture'

describe('productionRuleRegistry', () => {
  it('validates every approved-for-implementation rule and source reference', () => {
    expect(
      productionRuleRegistrySchema.safeParse(productionRuleRegistry).success,
    ).toBe(true)
    expect(productionRuleRegistry.rules.every((rule) => rule.mandatoryInGame)).toBe(
      true,
    )
  })

  it('blocks production while applicability and professional approvals are absent', () => {
    const result = evaluateProductionReadiness(
      productionRuleRegistry,
      [],
      [],
      new Date('2026-07-15T12:00:00.000Z'),
    )

    expect(result.ready).toBe(false)
    expect(result.blockers.some((blocker) => blocker.kind === 'applicability-missing')).toBe(
      true,
    )
    expect(result.blockers.some((blocker) => blocker.kind === 'approval-missing')).toBe(
      true,
    )
  })

  it('passes only with current evidence and every required named approval', () => {
    const { assessments, approvals } = productionReadinessFixture()
    const result = evaluateProductionReadiness(
      productionRuleRegistry,
      assessments,
      approvals,
      new Date('2026-07-16T12:00:00.000Z'),
    )

    expect(result).toMatchObject({ ready: true, blockers: [] })
  })

  it('expires the gate after a mandatory source recheck date', () => {
    const { assessments, approvals } = productionReadinessFixture()
    const result = evaluateProductionReadiness(
      productionRuleRegistry,
      assessments,
      approvals,
      new Date('2026-10-14T00:00:00.000Z'),
    )

    expect(result.ready).toBe(false)
    expect(result.blockers.some((blocker) => blocker.kind === 'source-expired')).toBe(
      true,
    )
  })
})
