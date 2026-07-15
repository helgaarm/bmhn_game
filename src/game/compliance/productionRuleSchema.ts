import { z } from 'zod'
import { journeyStageIdSchema } from '../content/campaignSchema'

export const productionRuleIds = [
  'co-purpose-legal-basis',
  'co-risk-dpia',
  'co-need-before-connection',
  'cn-helseid-suitability',
  'cn-helseid-production',
  'cn-helseid-client',
  'cn-fhir-conformance',
  'cn-smart-launch',
  'db-privacy-default',
  'db-access-audit',
  'db-encryption-integrity',
] as const

export const productionRuleIdSchema = z.enum(productionRuleIds)

export const ruleSourceSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(8),
    owner: z.string().min(2),
    sourceClass: z.enum([
      'law',
      'sector-norm',
      'service-documentation',
      'standard',
      'project-governance',
    ]),
    version: z.string().min(1),
    publishedOrUpdatedAt: z.string().date().nullable(),
    verifiedAt: z.string().date(),
    recheckDueAt: z.string().date(),
    urls: z.array(z.string().url()),
    note: z.string().min(12),
  })
  .superRefine((source, context) => {
    if (source.sourceClass !== 'project-governance' && source.urls.length === 0) {
      context.addIssue({
        code: 'custom',
        message: 'Authoritative public sources require at least one URL.',
        path: ['urls'],
      })
    }
    if (source.recheckDueAt <= source.verifiedAt) {
      context.addIssue({
        code: 'custom',
        message: 'Recheck date must be after the verification date.',
        path: ['recheckDueAt'],
      })
    }
  })

export const productionRuleSchema = z.object({
  id: productionRuleIdSchema,
  title: z.string().min(5),
  stageIds: z.array(journeyStageIdSchema).min(1),
  exactClaim: z.string().min(40),
  serviceScope: z.string().min(8),
  appliesWhen: z.string().min(12),
  exceptions: z.array(z.string().min(8)),
  expectedEvidence: z.array(z.string().min(8)).min(1),
  requiredApproverRoles: z.array(z.string().min(3)).min(1),
  sourceIds: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1),
  mandatoryInGame: z.literal(true),
  implementationStatus: z.literal('approved-for-implementation'),
  productionStatus: z.literal('pending-professional-approval'),
})

export const productionRuleRegistrySchema = z
  .object({
    version: z.number().int().positive(),
    approvedForImplementationAt: z.string().date(),
    sources: z.array(ruleSourceSchema).min(1),
    rules: z.array(productionRuleSchema).length(productionRuleIds.length),
  })
  .superRefine((registry, context) => {
    const sourceIds = new Set(registry.sources.map((source) => source.id))
    const seenRuleIds = new Set<string>()

    registry.rules.forEach((rule, index) => {
      if (seenRuleIds.has(rule.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate production rule: ${rule.id}`,
          path: ['rules', index, 'id'],
        })
      }
      seenRuleIds.add(rule.id)

      rule.sourceIds.forEach((sourceId) => {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: 'custom',
            message: `Unknown source ${sourceId} on rule ${rule.id}.`,
            path: ['rules', index, 'sourceIds'],
          })
        }
      })
    })

    productionRuleIds.forEach((ruleId) => {
      if (!seenRuleIds.has(ruleId)) {
        context.addIssue({
          code: 'custom',
          message: `Missing production rule: ${ruleId}`,
          path: ['rules'],
        })
      }
    })
  })

export type ProductionRuleId = z.infer<typeof productionRuleIdSchema>
export type RuleSource = z.infer<typeof ruleSourceSchema>
export type ProductionRule = z.infer<typeof productionRuleSchema>
export type ProductionRuleRegistry = z.infer<
  typeof productionRuleRegistrySchema
>
