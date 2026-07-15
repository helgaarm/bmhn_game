import type { AudienceId } from '../content/verticalSlice'

export interface NeedReadinessInput {
  needDescription: string
  audienceId: AudienceId | null
}

export type NeedReadinessResult =
  | { ready: true; normalizedNeed: string; audienceId: AudienceId }
  | { ready: false; normalizedNeed: string; reason: string }

export const MINIMUM_NEED_LENGTH = 24

/**
 * Phase 1 local adapter. It deliberately validates only learning-flow readiness,
 * not Helsenorge integration eligibility. A verified domain service can replace
 * this implementation without changing the quest state machine.
 */
export function evaluateNeedReadiness(
  input: NeedReadinessInput,
): NeedReadinessResult {
  const normalizedNeed = input.needDescription.trim()

  if (normalizedNeed.length < MINIMUM_NEED_LENGTH) {
    return {
      ready: false,
      normalizedNeed,
      reason: `Beskriv behovet med minst ${MINIMUM_NEED_LENGTH} tegn.`,
    }
  }

  if (!input.audienceId) {
    return {
      ready: false,
      normalizedNeed,
      reason: 'Velg hvem som først og fremst berøres av behovet.',
    }
  }

  return {
    ready: true,
    normalizedNeed,
    audienceId: input.audienceId,
  }
}
