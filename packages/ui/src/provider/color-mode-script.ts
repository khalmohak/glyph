import type { ColorMode } from '@glyphui/tokens'

// React-free on purpose: the Vite plugin imports this module in Node.

export type ColorModePreference = ColorMode | 'system'

export interface ColorModeOptions {
  /** Used when nothing is stored yet. */
  defaultMode?: ColorModePreference
  /** localStorage key. Set to `null` to disable persistence. */
  storageKey?: string | null
}

export const DARK_QUERY = '(prefers-color-scheme: dark)'
export const DEFAULT_STORAGE_KEY = 'glyph-mode'

/**
 * A tiny inline script that sets `data-mode` on `<html>` before first paint, so dark-mode
 * visitors never see a light flash. Use the same options as `GlyphProvider`.
 */
export function getColorModeScript({
  defaultMode = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
}: ColorModeOptions = {}): string {
  return `(function(){try{var d=${JSON.stringify(defaultMode)},m=null;${
    storageKey ? `m=localStorage.getItem(${JSON.stringify(storageKey)});` : ''
  }if(m!=='light'&&m!=='dark'&&m!=='system')m=d;if(m==='system')m=matchMedia('${DARK_QUERY}').matches?'dark':'light';var r=document.documentElement;r.dataset.mode=m;r.style.colorScheme=m}catch(e){}})()`
}
