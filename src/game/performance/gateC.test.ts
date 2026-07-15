import draftProfile from '../../../performance/gate-c.profile.json'
import {
  evaluateGateC,
  validateGateCProfile,
  type GateCProfile,
} from './gateC'

const approvedProfile: GateCProfile = {
  ...draftProfile,
  status: 'approved',
  hardware: {
    cpu: 'Reference CPU',
    gpu: 'Reference GPU',
    memoryGb: 16,
    powerMode: 'AC power / best performance',
  },
  operatingSystem: { name: 'Reference OS', version: '1' },
  browser: { name: 'Chromium', version: '1', channel: 'stable' },
  thresholds: {
    firstFrameP95MsMax: 1500,
    fpsP50Min: 45,
    fpsP05Min: 30,
    heapMbMax: 500,
  },
  approval: { approvedBy: 'Product and technical owner', approvedAt: '2026-07-15' },
}

describe('Gate C', () => {
  it('keeps the checked-in reference profile in a non-approvable draft state', () => {
    const result = validateGateCProfile(draftProfile)

    expect(result.structurallyValid).toBe(true)
    expect(result.readyForGate).toBe(false)
    expect(result.blockers).toEqual(
      expect.arrayContaining([
        expect.stringContaining('still draft'),
        expect.stringContaining('not agreed'),
        expect.stringContaining('thresholds'),
      ]),
    )
  })

  it('evaluates only an approved profile with the exact run count', () => {
    const incomplete = evaluateGateC(approvedProfile, [])

    expect(incomplete.status).toBe('not-evaluated')
    expect(incomplete.reasons[0]).toContain('Expected 5 measured runs')
  })

  it('passes measurements within approved thresholds', () => {
    const measurements = Array.from({ length: 5 }, (_, index) => ({
      firstFrameMs: 700 + index * 20,
      fpsSamples: [48, 52, 55, 58, 60],
      heapMb: 220 + index,
    }))
    const result = evaluateGateC(approvedProfile, measurements)

    expect(result.status).toBe('passed')
    expect(result.metrics?.fpsP50).toBeGreaterThanOrEqual(45)
  })

  it('fails without hiding the breached metrics', () => {
    const measurements = Array.from({ length: 5 }, () => ({
      firstFrameMs: 1800,
      fpsSamples: [20, 24, 28],
      heapMb: 600,
    }))
    const result = evaluateGateC(approvedProfile, measurements)

    expect(result.status).toBe('failed')
    expect(result.reasons).toHaveLength(4)
    expect(result.metrics).toEqual({
      firstFrameP95Ms: 1800,
      fpsP50: 24,
      fpsP05: 20,
      heapMbMax: 600,
    })
  })
})
