import { Button, defineTheme, presets, ThemeScope, useColorMode } from '@glyphui/ui'

const acme = defineTheme({
  name: 'acme',
  extends: presets.glyph,
  colors: {
    light: { primary: 'oklch(55% 0.19 45)', ring: 'oklch(55% 0.19 45)' },
    // A bright orange needs dark text on top to stay readable.
    dark: {
      primary: 'oklch(72% 0.17 45)',
      'primary-foreground': 'oklch(20% 0.04 45)',
      ring: 'oklch(72% 0.17 45)',
    },
  },
  radius: { md: '9999px' },
  components: { Button: { defaultVariants: { size: 'lg' } } },
})

export default function Example() {
  const { resolvedMode } = useColorMode()
  return (
    <ThemeScope
      theme={acme}
      mode={resolvedMode}
      className="flex flex-wrap gap-2 rounded-lg border border-border p-4"
    >
      <Button>Orange, pill, large</Button>
      <Button variant="outline">Same theme file</Button>
    </ThemeScope>
  )
}
