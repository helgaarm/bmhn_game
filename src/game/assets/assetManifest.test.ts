import manifest from '../../../assets/manifest.json'
import { validateAssetManifest } from './assetManifest'

const approvedAsset = {
  id: 'example-model',
  type: 'model',
  title: 'Example model',
  creator: 'Example creator',
  sourceUrl: 'https://example.org/items/example-model',
  licenseId: 'CC0-1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  redistributionAllowed: true,
  attribution: 'Example creator, CC0-1.0',
  downloadedAt: '2026-07-15',
  sha256: 'a'.repeat(64),
  modifications: 'None',
  runtimePath: '/game-assets/example-model.glb',
  reviewedBy: 'Release reviewer',
  reviewedAt: '2026-07-15',
  status: 'approved',
}

describe('assetManifest', () => {
  it('accepts the checked-in empty manifest without introducing an asset', () => {
    const result = validateAssetManifest(manifest)

    expect(result.valid).toBe(true)
    expect(result.manifest?.items).toEqual([])
  })

  it('accepts a complete item-level approval record', () => {
    const result = validateAssetManifest({
      schemaVersion: 1,
      updatedAt: '2026-07-15',
      items: [approvedAsset],
    })

    expect(result.valid).toBe(true)
  })

  it('rejects an asset without redistribution approval and provenance', () => {
    const result = validateAssetManifest({
      schemaVersion: 1,
      updatedAt: '2026-07-15',
      items: [
        {
          ...approvedAsset,
          sourceUrl: 'https://example.org/collection',
          licenseUrl: '',
          redistributionAllowed: false,
          sha256: 'unknown',
        },
      ],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('licenseUrl'),
        expect.stringContaining('redistributionAllowed'),
        expect.stringContaining('sha256'),
      ]),
    )
  })

  it('rejects duplicate ids and runtime paths', () => {
    const result = validateAssetManifest({
      schemaVersion: 1,
      updatedAt: '2026-07-15',
      items: [approvedAsset, approvedAsset],
    })

    expect(result.errors).toContain('Asset ids must be unique.')
    expect(result.errors).toContain('Asset runtime paths must be unique.')
  })
})
