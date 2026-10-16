import { type PresetName, presets } from '@glyphui/ui'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

const names = Object.keys(presets) as PresetName[]
const KEY = 'glyph-docs-theme'

const ThemeChoice = createContext<{ theme: PresetName; setTheme: (t: PresetName) => void } | null>(
  null,
)

export function ThemeChoiceProvider({ children }: { children: (theme: PresetName) => ReactNode }) {
  const [theme, setTheme] = useState<PresetName>(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return names.includes(stored as PresetName) ? (stored as PresetName) : 'glyph'
    } catch {
      return 'glyph'
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      // Storage blocked; the choice still applies for this visit.
    }
  }, [theme])
  return <ThemeChoice.Provider value={{ theme, setTheme }}>{children(theme)}</ThemeChoice.Provider>
}

export function useThemeChoice() {
  const value = useContext(ThemeChoice)
  if (!value) throw new Error('useThemeChoice must be used inside ThemeChoiceProvider.')
  return value
}
