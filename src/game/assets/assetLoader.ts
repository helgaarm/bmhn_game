export interface AssetProgress {
  url: string
  loadedBytes: number
  totalBytes: number | null
  ratio: number | null
}

export type AssetDiagnostic =
  | { type: 'started'; url: string }
  | { type: 'completed'; url: string; bytes: number }
  | { type: 'fallback'; url: string; fallbackUrl: string; reason: string }
  | { type: 'cancelled'; url: string }
  | { type: 'failed'; url: string; reason: string }

export interface AssetLoadOptions {
  signal?: AbortSignal
  onProgress?: (progress: AssetProgress) => void
  onDiagnostic?: (event: AssetDiagnostic) => void
  fetcher?: typeof fetch
}

export interface AssetWithSource {
  data: ArrayBuffer
  source: 'primary' | 'fallback'
  url: string
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export async function loadBinaryAsset(
  url: string,
  options: AssetLoadOptions = {},
): Promise<ArrayBuffer> {
  const fetcher = options.fetcher ?? fetch
  options.onDiagnostic?.({ type: 'started', url })

  try {
    const response = await fetcher(url, { signal: options.signal })
    if (!response.ok) {
      throw new Error(`Asset request failed with status ${response.status}.`)
    }

    const totalHeader = response.headers.get('content-length')
    const totalBytes = totalHeader ? Number(totalHeader) : null

    if (!response.body) {
      const data = await response.arrayBuffer()
      options.onProgress?.({
        url,
        loadedBytes: data.byteLength,
        totalBytes,
        ratio: totalBytes ? data.byteLength / totalBytes : null,
      })
      options.onDiagnostic?.({ type: 'completed', url, bytes: data.byteLength })
      return data
    }

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let loadedBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      loadedBytes += value.byteLength
      options.onProgress?.({
        url,
        loadedBytes,
        totalBytes,
        ratio: totalBytes ? loadedBytes / totalBytes : null,
      })
    }

    const combined = new Uint8Array(loadedBytes)
    let offset = 0
    chunks.forEach((chunk) => {
      combined.set(chunk, offset)
      offset += chunk.byteLength
    })

    options.onDiagnostic?.({ type: 'completed', url, bytes: loadedBytes })
    return combined.buffer
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) {
      options.onDiagnostic?.({ type: 'cancelled', url })
    } else {
      options.onDiagnostic?.({ type: 'failed', url, reason: errorMessage(error) })
    }
    throw error
  }
}

export async function loadBinaryAssetWithFallback(
  primaryUrl: string,
  fallbackUrl: string,
  options: AssetLoadOptions = {},
): Promise<AssetWithSource> {
  try {
    return {
      data: await loadBinaryAsset(primaryUrl, options),
      source: 'primary',
      url: primaryUrl,
    }
  } catch (error) {
    if (isAbortError(error) || options.signal?.aborted) throw error
    options.onDiagnostic?.({
      type: 'fallback',
      url: primaryUrl,
      fallbackUrl,
      reason: errorMessage(error),
    })
    return {
      data: await loadBinaryAsset(fallbackUrl, options),
      source: 'fallback',
      url: fallbackUrl,
    }
  }
}
