// Bundlers replace process.env.NODE_ENV; the typeof guard keeps unbundled browsers safe.
declare const process: { env: { NODE_ENV?: string } } | undefined

const warned = new Set<string>()

/** Logs a console warning once per key, in development only. */
export function warnOnce(key: string, message: string): void {
  if (typeof process === 'undefined' || process.env.NODE_ENV === 'production') return
  if (warned.has(key)) return
  warned.add(key)
  console.warn(`[glyph] ${message}`)
}
