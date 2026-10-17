import { defineTheme, presets } from '@glyphui/ui'

/** Ledgerline: the glyph preset with an emerald accent and slightly softer corners. */
export default defineTheme({
  name: 'ledgerline',
  extends: presets.glyph,
  colors: {
    light: { primary: 'oklch(52% 0.14 160)', ring: 'oklch(52% 0.14 160)' },
    dark: { primary: 'oklch(72% 0.16 160)', ring: 'oklch(72% 0.16 160)' },
  },
  radius: { md: '7px', lg: '12px' },
  components: {
    Button: { className: { base: 'tracking-tight' } },
  },
})
