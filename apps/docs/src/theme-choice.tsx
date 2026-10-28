import { type PresetName, presets, type Theme } from '@glyphui/ui'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { track } from './lib/analytics'
import { buildTheme, decodeState, encodeState, type StudioState } from './lib/theme-studio'

const names = Object.keys(presets) as PresetName[]
const KEY = 'glyph-docs-theme'
const CUSTOM_KEY = 'glyph-docs-custom-theme'

interface ThemeChoiceValue {
  /** The preset the site uses, or the preset a custom theme extends. */
  theme: PresetName
  /** Switches to a preset (and drops any custom theme). */
  setTheme: (theme: PresetName) => void
  /** A theme made in the theme studio and applied to the whole site, if any. */
  custom: StudioState | null
  setCustom: (state: StudioState | null) => void
}

const ThemeChoice = createContext<ThemeChoiceValue | null>(null)

function read<T>(key: string, parse: (value: string | null) => T): T {
  try {
    return parse(localStorage.getItem(key))
  } catch {
    return parse(null)
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Storage blocked; the choice still applies for this visit.
  }
}

/**
 * The site's theme: a preset, or a custom theme from the theme studio. `fixed` pins a theme
 * for this page without remembering it (block previews in iframes use it).
 */
export function ThemeChoiceProvider({
  children,
  fixed,
}: {
  children: (theme: Theme) => ReactNode
  fixed?: PresetName | undefined
}) {
  const [theme, setThemeState] = useState<PresetName>(() =>
    read(KEY, (stored) =>
      names.includes(stored as PresetName) ? (stored as PresetName) : 'glyph',
    ),
  )
  const [custom, setCustomState] = useState<StudioState | null>(() =>
    fixed ? null : read(CUSTOM_KEY, decodeState),
  )

  useEffect(() => {
    if (!fixed) write(KEY, theme)
  }, [theme, fixed])

  // Other documents on the site (another tab, or the blocks gallery's frames) follow changes.
  useEffect(() => {
    if (fixed) return
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY && names.includes(event.newValue as PresetName))
        setThemeState(event.newValue as PresetName)
      if (event.key === CUSTOM_KEY) setCustomState(decodeState(event.newValue))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [fixed])

  const setTheme = useCallback((next: PresetName) => {
    track('theme_preset_selected', { preset: next })
    setThemeState(next)
    setCustomState(null)
    write(CUSTOM_KEY, null)
  }, [])
  const setCustom = useCallback((state: StudioState | null) => {
    setCustomState(state)
    write(CUSTOM_KEY, state ? encodeState(state) : null)
    if (state) setThemeState(state.base)
  }, [])

  const resolved = useMemo(() => {
    if (fixed) return presets[fixed]
    if (custom) {
      try {
        return buildTheme(custom)
      } catch {
        // A stored theme that no longer builds falls back to its preset.
      }
    }
    return presets[theme]
  }, [fixed, custom, theme])

  const value = useMemo(
    () => ({ theme: fixed ?? theme, setTheme, custom, setCustom }),
    [fixed, theme, setTheme, custom, setCustom],
  )
  return <ThemeChoice.Provider value={value}>{children(resolved)}</ThemeChoice.Provider>
}

export function useThemeChoice() {
  const value = useContext(ThemeChoice)
  if (!value) throw new Error('useThemeChoice must be used inside ThemeChoiceProvider.')
  return value
}
