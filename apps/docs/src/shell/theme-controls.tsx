import {
  type ColorModePreference,
  IconButton,
  type PresetName,
  presets,
  Select,
  SelectItem,
  Tooltip,
  useColorMode,
} from '@glyphui/ui'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useThemeChoice } from '../theme-choice'

const modeIcon = { dark: <Moon />, light: <Sun />, system: <Monitor /> }
const nextMode: Record<ColorModePreference, ColorModePreference> = {
  dark: 'light',
  light: 'system',
  system: 'dark',
}
const modeLabel = { dark: 'Dark', light: 'Light', system: 'System' }

export const presetNames = Object.keys(presets) as PresetName[]
export const presetLabel = (name: PresetName) => name[0]!.toUpperCase() + name.slice(1)

/** The site-wide theme preset and color mode. */
export function ThemeControls() {
  const { theme, setTheme, custom } = useThemeChoice()
  const { mode, setMode } = useColorMode()
  return (
    <>
      <Select<PresetName | 'custom'>
        value={custom ? 'custom' : theme}
        onValueChange={(next) => next !== 'custom' && setTheme(next)}
        size="sm"
        aria-label="Site theme"
        className="w-32"
      >
        {presetNames.map((name) => (
          <SelectItem key={name} value={name}>
            {presetLabel(name)}
          </SelectItem>
        ))}
        {custom && <SelectItem value="custom">Custom</SelectItem>}
      </Select>
      <Tooltip content={`${modeLabel[mode]} mode`}>
        <IconButton
          size="sm"
          variant="ghost"
          icon={modeIcon[mode]}
          aria-label={`Color mode: ${modeLabel[mode]}. Switch to ${modeLabel[nextMode[mode]]}`}
          onClick={() => setMode(nextMode[mode])}
        />
      </Tooltip>
    </>
  )
}
