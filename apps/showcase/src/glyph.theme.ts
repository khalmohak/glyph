import { type PresetName, presets, type Theme } from '@glyphui/ui'

/**
 * The design file. A real app exports one theme here, e.g.
 *
 *   export default defineTheme({ name: 'acme', extends: presets.glyph, radius: { md: '6px' } })
 *
 * The showcase exposes all four presets so you can switch between them.
 */
export const themes: Record<PresetName, Theme> = presets

export const themeOptions: { value: PresetName; label: string; blurb: string }[] = [
  { value: 'glyph', label: 'Glyph', blurb: 'Precise, dark-first, one blue accent' },
  { value: 'brutalist', label: 'Brutalist', blurb: 'Hard edges, heavy borders, loud color' },
  { value: 'editorial', label: 'Editorial', blurb: 'Serif display, warm paper, hairlines' },
  { value: 'playful', label: 'Playful', blurb: 'Pills, pastels, springy motion' },
]
