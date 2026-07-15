import type {
  ProfessionalRuleApproval,
  RuleApplicabilityAssessment,
} from './productionReadiness'

export interface ProductionApprovalState {
  assessments: RuleApplicabilityAssessment[]
  approvals: ProfessionalRuleApproval[]
}
// Deliberately empty. Product approval activates the learning rules but does not
// stand in for named legal, privacy, security, standards or service approvals.
export const productionApprovalState: ProductionApprovalState = {
  assessments: [],
  approvals: [],
}
