import { describe, expect, it, vi } from 'vitest'
import {
  loadBinaryAsset,
  loadBinaryAssetWithFallback,
  type AssetDiagnostic,
  type AssetProgress,
} from './assetLoader'

describe('assetLoader', () => {
  it('reports byte progress and completion', async () => {
    const progress: AssetProgress[] = []
    const diagnostics: AssetDiagnostic[] = []
    const fetcher = vi.fn(async () =>
      new Response(new Uint8Array([1, 2, 3, 4]), {
        headers: { 'content-length': '4' },
      }),
    ) as typeof fetch

    const data = await loadBinaryAsset('/world.glb', {
      fetcher,
      onProgress: (event) => progress.push(event),
      onDiagnostic: (event) => diagnostics.push(event),
    })

    expect(data.byteLength).toBe(4)
    expect(progress.at(-1)).toMatchObject({ loadedBytes: 4, ratio: 1 })
    expect(diagnostics.at(-1)).toEqual({
      type: 'completed',
      url: '/world.glb',
      bytes: 4,
    })
  })

  it('loads an explicit fallback after a primary failure', async () => {
    const diagnostics: AssetDiagnostic[] = []
    const fetcher = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input)
      return url.includes('primary')
        ? new Response(null, { status: 503 })
        : new Response(new Uint8Array([9, 8]))
    }) as typeof fetch

    const result = await loadBinaryAssetWithFallback(
      '/primary.glb',
      '/fallback.glb',
      { fetcher, onDiagnostic: (event) => diagnostics.push(event) },
    )

    expect(result.source).toBe('fallback')
    expect(result.data.byteLength).toBe(2)
    expect(diagnostics.some((event) => event.type === 'fallback')).toBe(true)
  })

  it('does not turn cancellation into a fallback request', async () => {
    const controller = new AbortController()
    controller.abort()
    const fetcher = vi.fn(async (_input, init) => {
      if (init?.signal?.aborted) {
        throw new DOMException('Cancelled', 'AbortError')
      }
      return new Response(new Uint8Array())
    }) as typeof fetch

    await expect(
      loadBinaryAssetWithFallback('/primary.glb', '/fallback.glb', {
        signal: controller.signal,
        fetcher,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
