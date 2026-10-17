import { useEffect } from 'react'

// Bundlers replace process.env.NODE_ENV; the typeof guard keeps unbundled browsers safe.
declare const process: { env: { NODE_ENV?: string } } | undefined

export const VIEWERS_CSS_IMPORT = '@import "@glyphui/viewers/styles.css";'
const MARKER = '--glyph-viewers-css'

/** True when `@glyphui/viewers/styles.css` is loaded, detected by the marker property it defines. */
export function hasViewersStyles(root: Element = document.documentElement): boolean {
  return getComputedStyle(root).getPropertyValue(MARKER).trim() !== ''
}

let checked = false

/**
 * In development, warns once when the viewers stylesheet is missing. Without it Tailwind
 * never sees the viewers' classes and they render partly unstyled, with no error.
 */
export function useViewersStylesCheck(): void {
  useEffect(() => {
    if (checked || typeof process === 'undefined') return
    const env = process.env.NODE_ENV
    if (env === 'production' || env === 'test') return
    checked = true
    if (!hasViewersStyles()) {
      console.warn(
        `[glyph] @glyphui/viewers styles are missing, so viewers render partly unstyled. Add this line after @import "@glyphui/ui/styles.css" in your CSS:\n\n  ${VIEWERS_CSS_IMPORT}`,
      )
    }
  }, [])
}
