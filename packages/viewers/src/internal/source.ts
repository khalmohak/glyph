/**
 * What a viewer can display: a URL, raw bytes, or a File/Blob (e.g. from FileUpload).
 * Strings are always URLs; pass text content to text viewers through their `content` prop.
 */
export type ViewerSource = string | URL | ArrayBuffer | Uint8Array | Blob

/** Reads a source as bytes. URLs are fetched with `fetch`. */
export async function readBytes(source: ViewerSource, signal?: AbortSignal): Promise<ArrayBuffer> {
  if (source instanceof ArrayBuffer) return source
  if (source instanceof Uint8Array) {
    return source.buffer.slice(
      source.byteOffset,
      source.byteOffset + source.byteLength,
    ) as ArrayBuffer
  }
  if (typeof Blob !== 'undefined' && source instanceof Blob) return blobBytes(source)
  const response = await fetch(String(source), signal ? { signal } : undefined)
  if (!response.ok) throw new Error(`Could not load the file (HTTP ${response.status}).`)
  return response.arrayBuffer()
}

/** Reads a source as UTF-8 text, dropping a byte-order mark. */
export async function readText(source: ViewerSource, signal?: AbortSignal): Promise<string> {
  const bytes = await readBytes(source, signal)
  return new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '')
}

/** Blob → ArrayBuffer, also where `Blob.arrayBuffer` is missing (older jsdom, Safari 13). */
export function blobBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}

/** A display name for a source: the File's name or the URL's last path segment. */
export function sourceName(source: ViewerSource | undefined): string | undefined {
  if (!source) return undefined
  if (typeof File !== 'undefined' && source instanceof File) return source.name
  if (typeof source === 'string' || source instanceof URL) {
    let path: string
    try {
      // Relative URLs resolve against a placeholder; only the path matters.
      path = new URL(String(source), 'https://glyph.invalid').pathname
    } catch {
      path = String(source).split(/[?#]/)[0] ?? ''
    }
    const last = path.split('/').filter(Boolean).pop()
    return last ? decodeURIComponent(last) : undefined
  }
  return undefined
}

/** A URL for a source that `<img>`, `<video>` or a download link can use. Revoke it after. */
export function sourceUrl(source: ViewerSource): { url: string; revoke: () => void } {
  if (typeof source === 'string' || source instanceof URL) {
    return { url: String(source), revoke: () => {} }
  }
  const blob =
    typeof Blob !== 'undefined' && source instanceof Blob ? source : new Blob([source as BlobPart])
  const url = URL.createObjectURL(blob)
  return { url, revoke: () => URL.revokeObjectURL(url) }
}

/** Formats a byte count, e.g. `2.4 MB`. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return ''
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`
}
