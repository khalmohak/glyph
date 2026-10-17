/** The query parameter guards use to remember where the user was going. */
export const NEXT_PARAM = 'next'

/**
 * Returns `target` only if it is a same-origin path such as `/invoices?page=2`, else
 * `fallback`. Rejects absolute and protocol-relative URLs (`https://evil.com`, `//evil.com`,
 * `/\evil.com`), schemes like `javascript:`, and control characters, so a crafted `?next=`
 * can't send a freshly signed-in user to another site.
 */
export function safeRedirectPath(target: string | null | undefined, fallback = '/'): string {
  if (!target) return fallback
  let path = target
  try {
    // Guards encode the path once; decode once so `%2F%2Fevil.com` is caught too.
    path = decodeURIComponent(target)
  } catch {
    return fallback
  }
  if (!path.startsWith('/')) return fallback
  if (path.startsWith('//') || path.startsWith('/\\')) return fallback
  // biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point
  if (/[\u0000-\u001f\u007f\\]/.test(path)) return fallback
  try {
    // A path that resolves to another origin is never allowed.
    const base = 'https://glyph.invalid'
    if (new URL(path, base).origin !== base) return fallback
  } catch {
    return fallback
  }
  return path
}

/** `/sign-in?next=%2Finvoices%3Fpage%3D2` for a user who was on `/invoices?page=2`. */
export function signInPathFor(redirectTo: string, currentPath: string): string {
  if (!currentPath || currentPath === '/') return redirectTo
  const separator = redirectTo.includes('?') ? '&' : '?'
  return `${redirectTo}${separator}${NEXT_PARAM}=${encodeURIComponent(currentPath)}`
}
