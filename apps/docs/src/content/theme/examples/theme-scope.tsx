import { Badge, Button, presets, ThemeScope, useColorMode } from '@glyphui/ui'

export default function Example() {
  const { resolvedMode } = useColorMode()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Object.values(presets).map((theme) => (
        <ThemeScope
          key={theme.name}
          theme={theme}
          mode={resolvedMode}
          className="grid gap-3 rounded-lg border border-border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-h4 capitalize">{theme.name}</span>
            <Badge tone="primary">Preset</Badge>
          </div>
          <div className="flex gap-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
          </div>
        </ThemeScope>
      ))}
    </div>
  )
}
