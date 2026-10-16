import { type PresetName, Select, SelectItem } from '@glyphkit/ui'
import { useThemeChoice } from '../app'
import { themeOptions } from '../glyph.theme'

export function ThemeSelect({ className }: { className?: string }) {
  const { theme, setTheme } = useThemeChoice()
  return (
    <Select<PresetName>
      value={theme}
      onValueChange={setTheme}
      size="sm"
      aria-label="Theme"
      className={className}
    >
      {themeOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </Select>
  )
}
