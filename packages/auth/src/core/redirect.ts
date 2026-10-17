/** The query parameter guards use to remember where the user was going. */
export const NEXT_PARAM = 'next'

const BASE = 'https://glyph.invalid'

/** True when `path` is a plain same-origin path that stays one after URL normalization. */
function isLocalPath(path: string): boolean {
  if (!path.startsWith('/')) return false
  if (path.startsWith('//') || path.startsWith('/\\')) return false
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point
  if (/[\u0000-\u001f\u007f\\]/.test(path)) return false
  try {
    const url = new URL(path, BASE)
    // Dot segments can collapse into a protocol-relative path: `/..//evil.com` → `//evil.com`.
    return url.origin === BASE && !url.pathname.startsWith('//')
  } catch {
    return false
  }
}

function decodeOnce(value: string): string | null {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

/**
 * Returns `target` only if it is a same-origin path such as `/invoices?page=2`, else
 * `fallback`. Rejects absolute and protocol-relative URLs (`https://evil.com`, `//evil.com`,
 * `/\evil.com`), dot segments that resolve to one (`/..//evil.com`), schemes like
 * `javascript:`, and control characters, so a crafted `?next=` can't send a freshly
 * signed-in user to another site.
 *
 * Pass the value as `URLSearchParams.get()` returns it. Its own percent-encoding is kept
 * (`/search?q=a%26b` stays as is); a value that is still fully encoded (`%2Finvoices`) is
 * decoded once.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = '/'): string {
  if (!target) return fallback
  const decoded = decodeOnce(target)
  // A still-encoded path (`%2Finvoices%3Fpage%3D2`) is used in its decoded form.
  const path = target.startsWith('/') ? target : decoded
  if (!path || !isLocalPath(path)) return fallback
  // Encoded tricks (`/%2F%2Fevil.com`, `/%2e%2e//evil.com`) must be safe once decoded too.
  const pathDecoded = decodeOnce(path)
  if (pathDecoded !== null && pathDecoded !== path && !isLocalPath(pathDecoded)) return fallback
  return path
}

/** `/sign-in?next=%2Finvoices%3Fpage%3D2` for a user who was on `/invoices?page=2`. */
export function signInPathFor(redirectTo: string, currentPath: string): string {
  if (!currentPath || currentPath === '/') return redirectTo
  const separator = redirectTo.includes('?') ? '&' : '?'
  return `${redirectTo}${separator}${NEXT_PARAM}=${encodeURIComponent(currentPath)}`
}
