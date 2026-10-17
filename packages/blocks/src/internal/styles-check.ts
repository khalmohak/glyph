import { useEffect } from 'react'

// Bundlers replace process.env.NODE_ENV; the typeof guard keeps unbundled browsers safe.
declare const process: { env: { NODE_ENV?: string } } | undefined

export const BLOCKS_CSS_IMPORT = '@import "@glyphui/blocks/styles.css";'
const MARKER = '--glyph-blocks-css'

/** True when `@glyphui/blocks/styles.css` is loaded, detected by the marker property it defines. */
export function hasBlocksStyles(root: Element = document.documentElement): boolean {
  return getComputedStyle(root).getPropertyValue(MARKER).trim() !== ''
}

let checked = false

/**
 * In development, warns once when the blocks stylesheet is missing. Without it Tailwind
 * never sees the blocks' classes and they render partly unstyled, with no error.
 */
export function useBlocksStylesCheck(): void {
  useEffect(() => {
    if (checked || typeof process === 'undefined') return
    const env = process.env.NODE_ENV
    if (env === 'production' || env === 'test') return
    checked = true
    if (!hasBlocksStyles()) {
      console.warn(
        `[glyph] @glyphui/blocks styles are missing, so blocks render partly unstyled. Add this line after @import "@glyphui/ui/styles.css" in your CSS:\n\n  ${BLOCKS_CSS_IMPORT}`,
      )
    }
  }, [])
}
