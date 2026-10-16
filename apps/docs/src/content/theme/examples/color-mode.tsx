import { type ColorModePreference, SegmentedControl, Text, useColorMode } from '@glyphui/ui'

export default function Example() {
  const { mode, resolvedMode, setMode } = useColorMode()
  return (
    <div className="grid gap-2">
      <SegmentedControl<ColorModePreference>
        aria-label="Color mode"
        value={mode}
        onValueChange={setMode}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'system', label: 'System' },
        ]}
      />
      <Text size="small" tone="muted">
        Showing {resolvedMode} mode.
      </Text>
    </div>
  )
}
