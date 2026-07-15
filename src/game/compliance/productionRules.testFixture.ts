import type {
  ProfessionalRuleApproval,
  RuleApplicabilityAssessment,
} from './productionReadiness'
import { productionRuleRegistry } from './productionRules'

export function productionReadinessFixture(): {
  assessments: RuleApplicabilityAssessment[]
  approvals: ProfessionalRuleApproval[]
} {
  const assessedAt = '2026-07-16T08:00:00.000Z'
  return {
    assessments: productionRuleRegistry.rules.map((rule) => ({
      ruleId: rule.id,
      applicability: 'applicable',
      rationale: 'Syntetisk test av en fullstendig faglig anvendelsesvurdering.',
      evidence: ['Kontrollert testbevis'],
      assessedByName: 'Syntetisk fagperson',
      assessedByRole: rule.requiredApproverRoles[0],
      assessedAt,
      registryVersion: productionRuleRegistry.version,
    })),
    approvals: productionRuleRegistry.rules.flatMap((rule) =>
      rule.requiredApproverRoles.map((approverRole) => ({
        ruleId: rule.id,
        approverName: 'Syntetisk godkjenner',
        approverRole,
        decision: 'approved' as const,
        approvedAt: assessedAt,
        registryVersion: productionRuleRegistry.version,
      })),
    ),
  }
}
