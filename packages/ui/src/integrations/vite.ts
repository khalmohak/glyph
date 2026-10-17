import { type ColorModeOptions, getColorModeScript } from '../provider/color-mode-script'

/** The subset of Vite's `Plugin` this plugin uses, so `vite` stays an optional peer. */
export interface GlyphVitePlugin {
  name: string
  transformIndexHtml: {
    order: 'pre'
    handler: () => { tag: 'script'; children: string; injectTo: 'head-prepend' }[]
  }
}

/**
 * Injects Glyph's color-mode script into `index.html` so dark-mode visitors never see a
 * light flash. Pass the same `defaultMode` and `storageKey` as `GlyphProvider`.
 *
 * ```ts
 * // vite.config.ts
 * import { glyphColorMode } from '@glyphui/ui/vite'
 * export default defineConfig({ plugins: [react(), tailwindcss(), glyphColorMode()] })
 * ```
 */
export function glyphColorMode(options: ColorModeOptions = {}): GlyphVitePlugin {
  const script = getColorModeScript(options)
  return {
    name: 'glyph:color-mode',
    transformIndexHtml: {
      order: 'pre',
      handler: () => [{ tag: 'script', children: script, injectTo: 'head-prepend' }],
    },
  }
}

export type { ColorModeOptions }
