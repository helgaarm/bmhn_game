import { z } from 'zod'

export const journeyStageIds = [
  'discover',
  'understand-assess',
  'clarify-order',
  'connect',
  'design-build',
  'test-assure',
  'operate',
  'follow-up-improve',
  'close',
] as const

export const journeyStageIdSchema = z.enum(journeyStageIds)

const gateSchema = z.object({
  kind: z.enum([
    'missing-fact',
    'unresolved-decision',
    'invalid-choice',
    'evidence-check',
  ]),
  question: z.string().min(12),
  successCondition: z.string().min(12),
})

export const campaignStageSchema = z.object({
  id: journeyStageIdSchema,
  sequence: z.number().int().min(1).max(9),
  label: z.string().min(2),
  zone: z.string().min(2),
  informationLevel: z.enum(['N1', 'N2', 'N3']),
  objective: z.string().min(20),
  ownerRole: z.string().min(2),
  entryCriteria: z.array(z.string().min(8)).min(1),
  exitEvidence: z.array(z.string().min(8)).min(1),
  gate: gateSchema,
  nextStageId: journeyStageIdSchema.nullable(),
  sourceIds: z.array(z.string().min(3)).min(1),
})

export const campaignSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    version: z.number().int().positive(),
    contentProfile: z.literal('public'),
    title: z.string().min(4),
    summary: z.string().min(20),
    scenarioOrganisation: z.string().min(3),
    stages: z.array(campaignStageSchema).length(9),
  })
  .superRefine((campaign, context) => {
    const seenIds = new Set<string>()

    campaign.stages.forEach((stage, index) => {
      if (seenIds.has(stage.id)) {
        context.addIssue({
          code: 'custom',
          message: `Duplicate stage id: ${stage.id}`,
          path: ['stages', index, 'id'],
        })
      }
      seenIds.add(stage.id)

      const expectedId = journeyStageIds[index]
      if (stage.id !== expectedId) {
        context.addIssue({
          code: 'custom',
          message: `Expected stage ${expectedId} at sequence ${index + 1}.`,
          path: ['stages', index, 'id'],
        })
      }

      if (stage.sequence !== index + 1) {
        context.addIssue({
          code: 'custom',
          message: `Stage ${stage.id} has an invalid sequence.`,
          path: ['stages', index, 'sequence'],
        })
      }

      const expectedNext = journeyStageIds[index + 1] ?? null
      if (stage.nextStageId !== expectedNext) {
        context.addIssue({
          code: 'custom',
          message: `Stage ${stage.id} must point to ${expectedNext ?? 'null'}.`,
          path: ['stages', index, 'nextStageId'],
        })
      }
    })
  })

export type CampaignDefinition = z.infer<typeof campaignSchema>
export type CampaignStage = z.infer<typeof campaignStageSchema>
export type JourneyStageId = z.infer<typeof journeyStageIdSchema>

export function validateCampaign(input: unknown): CampaignDefinition {
  return campaignSchema.parse(input)
}
