export const GATE_C_PROFILE_SCHEMA_VERSION = 1

export interface GateCProfile {
  schemaVersion: number
  status: 'draft' | 'approved'
  id: string
  hardware: {
    cpu: string
    gpu: string
    memoryGb: number
    powerMode: string
  }
  operatingSystem: {
    name: string
    version: string
  }
  browser: {
    name: string
    version: string
    channel: string
  }
  viewport: {
    width: number
    height: number
    deviceScaleFactor: number
  }
  network: {
    profile: string
    latencyMs: number
    downloadMbps: number
  }
  protocol: {
    warmupRuns: number
    measuredRuns: number
    fpsSampleSeconds: number
  }
  thresholds: {
    firstFrameP95MsMax: number | null
    fpsP50Min: number | null
    fpsP05Min: number | null
    heapMbMax: number | null
  }
  approval: {
    approvedBy: string | null
    approvedAt: string | null
  }
}

export interface GateCMeasurement {
  firstFrameMs: number
  fpsSamples: number[]
  heapMb: number | null
}

export interface GateCProfileValidation {
  structurallyValid: boolean
  readyForGate: boolean
  errors: string[]
  blockers: string[]
}

export interface GateCEvaluation {
  status: 'passed' | 'failed' | 'not-evaluated'
  reasons: string[]
  metrics?: {
    firstFrameP95Ms: number
    fpsP50: number
    fpsP05: number
    heapMbMax: number | null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function positiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function nonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isThreshold(value: unknown): value is number | null {
  return value === null || positiveNumber(value)
}

export function validateGateCProfile(input: unknown): GateCProfileValidation {
  if (!isRecord(input)) {
    return {
      structurallyValid: false,
      readyForGate: false,
      errors: ['Profile must be an object.'],
      blockers: [],
    }
  }

  const errors: string[] = []
  const nestedKeys = [
    'hardware',
    'operatingSystem',
    'browser',
    'viewport',
    'network',
    'protocol',
    'thresholds',
    'approval',
  ] as const
  for (const key of nestedKeys) {
    if (!isRecord(input[key])) errors.push(`${key} must be an object.`)
  }
  if (errors.length > 0) {
    return { structurallyValid: false, readyForGate: false, errors, blockers: [] }
  }

  const profile = input as unknown as GateCProfile
  if (profile.schemaVersion !== GATE_C_PROFILE_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${GATE_C_PROFILE_SCHEMA_VERSION}.`)
  }
  if (!['draft', 'approved'].includes(profile.status)) {
    errors.push('status must be draft or approved.')
  }
  if (!nonEmpty(profile.id)) errors.push('id is required.')
  if (!nonEmpty(profile.hardware.cpu)) errors.push('hardware.cpu is required.')
  if (!nonEmpty(profile.hardware.gpu)) errors.push('hardware.gpu is required.')
  if (!nonNegativeNumber(profile.hardware.memoryGb)) {
    errors.push('hardware.memoryGb must be zero or greater.')
  }
  if (!nonEmpty(profile.hardware.powerMode)) {
    errors.push('hardware.powerMode is required.')
  }
  if (!nonEmpty(profile.operatingSystem.name)) {
    errors.push('operatingSystem.name is required.')
  }
  if (!nonEmpty(profile.operatingSystem.version)) {
    errors.push('operatingSystem.version is required.')
  }
  if (!nonEmpty(profile.browser.name) || !nonEmpty(profile.browser.version)) {
    errors.push('browser name and version are required.')
  }
  if (!positiveNumber(profile.viewport.width) || !positiveNumber(profile.viewport.height)) {
    errors.push('viewport width and height must be positive.')
  }
  if (!positiveNumber(profile.viewport.deviceScaleFactor)) {
    errors.push('viewport.deviceScaleFactor must be positive.')
  }
  if (
    !nonNegativeNumber(profile.network.latencyMs) ||
    !nonNegativeNumber(profile.network.downloadMbps)
  ) {
    errors.push('network values must be zero or greater.')
  }
  if (
    !positiveNumber(profile.protocol.warmupRuns) ||
    !positiveNumber(profile.protocol.measuredRuns) ||
    !positiveNumber(profile.protocol.fpsSampleSeconds)
  ) {
    errors.push('protocol run counts and sample duration must be positive.')
  }
  for (const [key, value] of Object.entries(profile.thresholds)) {
    if (!isThreshold(value)) errors.push(`thresholds.${key} must be null or positive.`)
  }

  const blockers: string[] = []
  if (profile.status !== 'approved') blockers.push('Reference profile is still draft.')
  if (
    profile.hardware.cpu === 'TBD' ||
    profile.hardware.gpu === 'TBD' ||
    profile.operatingSystem.name === 'TBD' ||
    profile.browser.version === 'TBD'
  ) {
    blockers.push('Reference hardware, operating system, and browser are not agreed.')
  }
  if (
    profile.thresholds.firstFrameP95MsMax === null ||
    profile.thresholds.fpsP50Min === null ||
    profile.thresholds.fpsP05Min === null
  ) {
    blockers.push('Required performance thresholds are not approved.')
  }
  if (!profile.approval.approvedBy || !profile.approval.approvedAt) {
    blockers.push('Approval owner and date are missing.')
  }

  return {
    structurallyValid: errors.length === 0,
    readyForGate: errors.length === 0 && blockers.length === 0,
    errors,
    blockers,
  }
}

function percentile(values: number[], percentileValue: number) {
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(percentileValue * sorted.length) - 1),
  )
  return sorted[index]
}

export function evaluateGateC(
  profile: GateCProfile,
  measurements: GateCMeasurement[],
): GateCEvaluation {
  const validation = validateGateCProfile(profile)
  if (!validation.readyForGate) {
    return {
      status: 'not-evaluated',
      reasons: [...validation.errors, ...validation.blockers],
    }
  }
  if (measurements.length !== profile.protocol.measuredRuns) {
    return {
      status: 'not-evaluated',
      reasons: [
        `Expected ${profile.protocol.measuredRuns} measured runs, received ${measurements.length}.`,
      ],
    }
  }
  const fpsSamples = measurements.flatMap((measurement) => measurement.fpsSamples)
  if (fpsSamples.length === 0) {
    return { status: 'not-evaluated', reasons: ['No FPS samples were captured.'] }
  }

  const heapValues = measurements
    .map((measurement) => measurement.heapMb)
    .filter((value): value is number => value !== null)
  const metrics = {
    firstFrameP95Ms: percentile(
      measurements.map((measurement) => measurement.firstFrameMs),
      0.95,
    ),
    fpsP50: percentile(fpsSamples, 0.5),
    fpsP05: percentile(fpsSamples, 0.05),
    heapMbMax: heapValues.length > 0 ? Math.max(...heapValues) : null,
  }
  const reasons: string[] = []
  if (metrics.firstFrameP95Ms > profile.thresholds.firstFrameP95MsMax!) {
    reasons.push('First-frame p95 exceeds the approved maximum.')
  }
  if (metrics.fpsP50 < profile.thresholds.fpsP50Min!) {
    reasons.push('FPS p50 is below the approved minimum.')
  }
  if (metrics.fpsP05 < profile.thresholds.fpsP05Min!) {
    reasons.push('FPS p05 is below the approved minimum.')
  }
  if (
    profile.thresholds.heapMbMax !== null &&
    metrics.heapMbMax !== null &&
    metrics.heapMbMax > profile.thresholds.heapMbMax
  ) {
    reasons.push('Heap usage exceeds the approved maximum.')
  }

  return {
    status: reasons.length === 0 ? 'passed' : 'failed',
    reasons,
    metrics,
  }
}
