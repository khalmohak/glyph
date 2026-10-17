/**
 * What a viewer can display: a URL, raw bytes, or a File/Blob (e.g. from FileUpload).
 * Strings are always URLs; pass text content to text viewers through their `content` prop.
 */
export type ViewerSource = string | URL | ArrayBuffer | Uint8Array | Blob

function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return Object.prototype.toString.call(value) === '[object ArrayBuffer]'
}

/** Reads a source as bytes. URLs are fetched with `fetch`. */
export async function readBytes(source: ViewerSource, signal?: AbortSignal): Promise<ArrayBuffer> {
  // Realm-safe checks: bytes from an iframe, a worker or Node's TextEncoder fail `instanceof`.
  if (isArrayBuffer(source)) return source
  if (ArrayBuffer.isView(source)) {
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

/**
 * Reads a source as text. UTF-16 files are recognized by their byte-order mark (Excel's
 * "Unicode text" export), UTF-8 is used when the bytes are valid UTF-8, and anything else
 * is read as Windows-1252, the default for CSV files saved by Excel on Windows.
 */
export async function readText(source: ViewerSource, signal?: AbortSignal): Promise<string> {
  return decodeText(new Uint8Array(await readBytes(source, signal)))
}

export type TextEncodingName = 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1252'

/**
 * Guesses a text file's encoding from its bytes (or the first few KB of it): a UTF-16
 * byte-order mark, else UTF-8 when the bytes are valid UTF-8, else Windows-1252.
 */
export function detectEncoding(bytes: Uint8Array): TextEncodingName {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le'
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be'
  try {
    // `stream` tolerates a multi-byte character cut off at the end of a sample.
    new TextDecoder('utf-8', { fatal: true }).decode(bytes, { stream: true })
    return 'utf-8'
  } catch {
    return 'windows-1252'
  }
}

/** Decodes bytes as text; see `readText`. */
export function decodeText(bytes: Uint8Array): string {
  const encoding = detectEncoding(bytes)
  const text = new TextDecoder(encoding).decode(bytes)
  return encoding === 'utf-8' ? text.replace(/^\uFEFF/, '') : text
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
    if (!last) return undefined
    try {
      return decodeURIComponent(last)
    } catch {
      // Not valid percent-encoding (e.g. `report%.pdf`): show it as it is.
      return last
    }
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
