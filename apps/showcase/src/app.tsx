import { GlyphProvider, type PresetName } from '@glyphkit/ui'
import { createContext, useContext } from 'react'
import { themeOptions, themes } from './glyph.theme'
import { Showcase } from './sections/components'
import { Footer } from './sections/footer'
import { Hero } from './sections/hero'
import { Patterns } from './sections/patterns'
import { SiteNavbar } from './sections/site-navbar'
import { Tokens } from './sections/tokens'
import { useStoredState } from './use-stored-state'

const ThemeChoice = createContext<{ theme: PresetName; setTheme: (t: PresetName) => void } | null>(
  null,
)

export function useThemeChoice() {
  const value = useContext(ThemeChoice)
  if (!value) throw new Error('useThemeChoice must be used inside <App>.')
  return value
}

const modes = ['light', 'dark', 'system'] as const
type Mode = (typeof modes)[number]
const isMode = (value: unknown): value is Mode => modes.includes(value as Mode)

/**
 * Dark-first by default. A `?mode=` link or a host page's `data-theme` (when the showcase is
 * embedded) can choose instead; the user's own pick, once made, is stored and wins.
 */
function initialMode(): Mode {
  const param = new URLSearchParams(window.location.search).get('mode')
  if (isMode(param)) {
    try {
      localStorage.setItem('glyph-mode', param)
    } catch {
      // Storage blocked: fall through to the default below.
    }
    return param
  }
  const host = document.documentElement.getAttribute('data-theme')
  return isMode(host) ? host : 'dark'
}

const defaultMode = initialMode()

export function App() {
  const [theme, setTheme] = useStoredState<PresetName>(
    'glyph-showcase-theme',
    'glyph',
    themeOptions.map((o) => o.value),
    'theme',
  )
  return (
    <GlyphProvider theme={themes[theme]} defaultMode={defaultMode}>
      <ThemeChoice.Provider value={{ theme, setTheme }}>
        <SiteNavbar />
        <main>
          <Hero />
          <Tokens />
          <Showcase />
          <Patterns />
        </main>
        <Footer />
      </ThemeChoice.Provider>
    </GlyphProvider>
  )
}
