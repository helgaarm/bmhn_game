export const ASSET_MANIFEST_SCHEMA_VERSION = 1

export type ExternalAssetType =
  | 'model'
  | 'audio'
  | 'texture'
  | 'animation'
  | 'icon'
  | 'font'
  | 'image'

export interface ApprovedAssetRecord {
  id: string
  type: ExternalAssetType
  title: string
  creator: string
  sourceUrl: string
  licenseId: string
  licenseUrl: string
  redistributionAllowed: true
  attribution: string
  downloadedAt: string
  sha256: string
  modifications: string
  runtimePath: string
  reviewedBy: string
  reviewedAt: string
  status: 'approved'
}

export interface AssetManifest {
  schemaVersion: number
  updatedAt: string
  items: ApprovedAssetRecord[]
}

export interface AssetManifestValidation {
  valid: boolean
  errors: string[]
  manifest?: AssetManifest
}

const assetTypes = new Set<ExternalAssetType>([
  'model',
  'audio',
  'texture',
  'animation',
  'icon',
  'font',
  'image',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isHttpsUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function validateAsset(item: unknown, index: number): string[] {
  const prefix = `items[${index}]`
  if (!isRecord(item)) return [`${prefix} must be an object.`]

  const errors: string[] = []
  const requiredStrings = [
    'id',
    'title',
    'creator',
    'licenseId',
    'attribution',
    'sha256',
    'modifications',
    'runtimePath',
    'reviewedBy',
  ] as const

  for (const field of requiredStrings) {
    if (!isNonEmptyString(item[field])) {
      errors.push(`${prefix}.${field} is required.`)
    }
  }
  if (!assetTypes.has(item.type as ExternalAssetType)) {
    errors.push(`${prefix}.type is not supported.`)
  }
  if (!isHttpsUrl(item.sourceUrl)) {
    errors.push(`${prefix}.sourceUrl must be an HTTPS item-level URL.`)
  }
  if (!isHttpsUrl(item.licenseUrl)) {
    errors.push(`${prefix}.licenseUrl must be an HTTPS licence URL.`)
  }
  if (item.redistributionAllowed !== true) {
    errors.push(`${prefix}.redistributionAllowed must be explicitly true.`)
  }
  if (!isIsoDate(item.downloadedAt)) {
    errors.push(`${prefix}.downloadedAt must use YYYY-MM-DD.`)
  }
  if (!isIsoDate(item.reviewedAt)) {
    errors.push(`${prefix}.reviewedAt must use YYYY-MM-DD.`)
  }
  if (item.status !== 'approved') {
    errors.push(`${prefix}.status must be approved before runtime use.`)
  }
  if (
    typeof item.sha256 === 'string' &&
    !/^[a-f0-9]{64}$/i.test(item.sha256)
  ) {
    errors.push(`${prefix}.sha256 must be a 64-character hexadecimal digest.`)
  }
  if (
    typeof item.runtimePath === 'string' &&
    (!item.runtimePath.startsWith('/game-assets/') || item.runtimePath.includes('..'))
  ) {
    errors.push(`${prefix}.runtimePath must stay under /game-assets/.`)
  }

  return errors
}

export function validateAssetManifest(
  input: unknown,
): AssetManifestValidation {
  if (!isRecord(input)) {
    return { valid: false, errors: ['Manifest must be an object.'] }
  }

  const errors: string[] = []
  if (input.schemaVersion !== ASSET_MANIFEST_SCHEMA_VERSION) {
    errors.push(
      `schemaVersion must be ${ASSET_MANIFEST_SCHEMA_VERSION}.`,
    )
  }
  if (!isIsoDate(input.updatedAt)) {
    errors.push('updatedAt must use YYYY-MM-DD.')
  }
  if (!Array.isArray(input.items)) {
    errors.push('items must be an array.')
  } else {
    input.items.forEach((item, index) => {
      errors.push(...validateAsset(item, index))
    })
    const ids = input.items
      .filter(isRecord)
      .map((item) => item.id)
      .filter(isNonEmptyString)
    if (new Set(ids).size !== ids.length) {
      errors.push('Asset ids must be unique.')
    }
    const runtimePaths = input.items
      .filter(isRecord)
      .map((item) => item.runtimePath)
      .filter(isNonEmptyString)
    if (new Set(runtimePaths).size !== runtimePaths.length) {
      errors.push('Asset runtime paths must be unique.')
    }
  }

  return errors.length === 0
    ? { valid: true, errors, manifest: input as unknown as AssetManifest }
    : { valid: false, errors }
}
