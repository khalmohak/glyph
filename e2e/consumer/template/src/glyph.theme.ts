import { defineTheme, presets } from '@glyphui/ui'

export default defineTheme({
  name: 'consumer',
  extends: presets.glyph,
  colors: { dark: { primary: 'oklch(72% 0.16 160)' } },
  radius: { md: '7px' },
  components: {
    Button: { defaultVariants: { size: 'md' }, className: { base: 'tracking-tight' } },
  },
})
