import { describe, expect, it } from 'vitest'
import { firstCampaign } from './firstCampaign'
import { campaignSchema } from './campaignSchema'
import { productionRuleRegistry } from '../compliance/productionRules'

describe('firstCampaign', () => {
  it('contains a validated nine-stage public campaign spine', () => {
    expect(campaignSchema.safeParse(firstCampaign).success).toBe(true)
    expect(firstCampaign.stages).toHaveLength(9)
    expect(firstCampaign.stages[0].id).toBe('discover')
    expect(firstCampaign.stages.at(-1)?.nextStageId).toBeNull()
  })

  it('rejects broken stage transitions', () => {
    const broken = structuredClone(firstCampaign)
    broken.stages[2].nextStageId = 'operate'

    const result = campaignSchema.safeParse(broken)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('must point to connect')
    }
  })

  it('binds every mandatory rule to its declared campaign stage', () => {
    const campaignRuleIds = new Set(
      firstCampaign.stages.flatMap((stage) => stage.requiredRuleIds),
    )

    expect(campaignRuleIds).toEqual(
      new Set(productionRuleRegistry.rules.map((rule) => rule.id)),
    )
    for (const rule of productionRuleRegistry.rules) {
      for (const stageId of rule.stageIds) {
        expect(
          firstCampaign.stages.find((stage) => stage.id === stageId)
            ?.requiredRuleIds,
        ).toContain(rule.id)
      }
    }
  })
})
