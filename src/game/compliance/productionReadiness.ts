import type {
  ProductionRuleId,
  ProductionRuleRegistry,
} from './productionRuleSchema'

export interface RuleApplicabilityAssessment {
  ruleId: ProductionRuleId
  applicability: 'applicable' | 'not-applicable'
  rationale: string
  evidence: string[]
  assessedByName: string
  assessedByRole: string
  assessedAt: string
  registryVersion: number
}
export interface ProfessionalRuleApproval {
  ruleId: ProductionRuleId
  approverName: string
  approverRole: string
  decision: 'approved' | 'rejected'
  approvedAt: string
  registryVersion: number
}

export type ProductionBlockerKind =
  | 'applicability-missing'
  | 'applicability-invalid'
  | 'source-expired'
  | 'approval-missing'
  | 'approval-rejected'
  | 'approval-outdated'

export interface ProductionBlocker {
  ruleId: ProductionRuleId
  kind: ProductionBlockerKind
  message: string
}

export interface ProductionReadinessResult {
  ready: boolean
  evaluatedAt: string
  registryVersion: number
  blockers: ProductionBlocker[]
}

function isValidDate(value: string) {
  return !Number.isNaN(Date.parse(value))
}

export function evaluateProductionReadiness(
  registry: ProductionRuleRegistry,
  assessments: RuleApplicabilityAssessment[],
  approvals: ProfessionalRuleApproval[],
  evaluatedAt: Date = new Date(),
): ProductionReadinessResult {
  const blockers: ProductionBlocker[] = []
  const evaluationDate = evaluatedAt.toISOString().slice(0, 10)
  const sources = new Map(registry.sources.map((source) => [source.id, source]))

  for (const rule of registry.rules) {
    const assessment = assessments.find((item) => item.ruleId === rule.id)
    if (!assessment) {
      blockers.push({
        ruleId: rule.id,
        kind: 'applicability-missing',
        message: `${rule.title}: anvendelse er ikke faglig vurdert.`,
      })
    } else if (
      assessment.registryVersion !== registry.version ||
      !assessment.rationale.trim() ||
      assessment.evidence.length === 0 ||
      !assessment.evidence.every((item) => item.trim()) ||
      !assessment.assessedByName.trim() ||
      !assessment.assessedByRole.trim() ||
      !isValidDate(assessment.assessedAt)
    ) {
      blockers.push({
        ruleId: rule.id,
        kind: 'applicability-invalid',
        message: `${rule.title}: anvendelsesvurderingen er ufullstendig eller gjelder feil registerversjon.`,
      })
    }

    const ruleSources = rule.sourceIds
      .map((sourceId) => sources.get(sourceId))
      .filter((source) => source !== undefined)

    for (const source of ruleSources) {
      if (source.recheckDueAt < evaluationDate) {
        blockers.push({
          ruleId: rule.id,
          kind: 'source-expired',
          message: `${rule.title}: kilden «${source.title}» skulle vært kontrollert på nytt ${source.recheckDueAt}.`,
        })
      }
    }

    for (const requiredRole of rule.requiredApproverRoles) {
      const approval = approvals.find(
        (item) => item.ruleId === rule.id && item.approverRole === requiredRole,
      )
      if (!approval) {
        blockers.push({
          ruleId: rule.id,
          kind: 'approval-missing',
          message: `${rule.title}: mangler godkjenning fra ${requiredRole}.`,
        })
        continue
      }
      if (approval.decision === 'rejected') {
        blockers.push({
          ruleId: rule.id,
          kind: 'approval-rejected',
          message: `${rule.title}: ${requiredRole} har avvist regelen eller anvendelsen.`,
        })
        continue
      }
      const latestSourceVerification = ruleSources.reduce(
        (latest, source) =>
          source.verifiedAt > latest ? source.verifiedAt : latest,
        '0000-00-00',
      )
      if (
        approval.registryVersion !== registry.version ||
        !approval.approverName.trim() ||
        !isValidDate(approval.approvedAt) ||
        approval.approvedAt.slice(0, 10) < latestSourceVerification
      ) {
        blockers.push({
          ruleId: rule.id,
          kind: 'approval-outdated',
          message: `${rule.title}: godkjenningen fra ${requiredRole} er ufullstendig, utdatert eller gjelder feil registerversjon.`,
        })
      }
    }
  }

  return {
    ready: blockers.length === 0,
    evaluatedAt: evaluatedAt.toISOString(),
    registryVersion: registry.version,
    blockers,
  }
}
