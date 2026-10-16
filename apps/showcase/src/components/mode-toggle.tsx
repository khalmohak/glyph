import { type ColorModePreference, IconButton, Tooltip, useColorMode } from '@glyphkit/ui'
import { Monitor, Moon, Sun } from 'lucide-react'

const next: Record<ColorModePreference, ColorModePreference> = {
  dark: 'light',
  light: 'system',
  system: 'dark',
}
const icon = { dark: <Moon />, light: <Sun />, system: <Monitor /> }
const label = { dark: 'Dark', light: 'Light', system: 'System' }

export function ModeToggle() {
  const { mode, setMode } = useColorMode()
  return (
    <Tooltip content={`${label[mode]} mode. Switch to ${label[next[mode]].toLowerCase()}.`}>
      <IconButton
        size="sm"
        icon={icon[mode]}
        aria-label={`Color mode: ${label[mode]}. Switch to ${label[next[mode]]}.`}
        onClick={() => setMode(next[mode])}
      />
    </Tooltip>
  )
}
