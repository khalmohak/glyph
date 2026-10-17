import type { ColorMode } from '@glyphui/tokens'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  type ColorModeOptions,
  type ColorModePreference,
  DARK_QUERY,
  DEFAULT_STORAGE_KEY,
  getColorModeScript,
} from './color-mode-script'

export {
  type ColorModeOptions,
  type ColorModePreference,
  getColorModeScript,
} from './color-mode-script'

export interface ColorModeContextValue {
  /** What the user chose. */
  mode: ColorModePreference
  /** What is shown: `system` resolved against the OS setting. */
  resolvedMode: ColorMode
  setMode: (mode: ColorModePreference) => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

const isBrowser = typeof window !== 'undefined'

function readStoredMode(storageKey: string | null): ColorModePreference | null {
  if (!isBrowser || !storageKey) return null
  try {
    const value = window.localStorage.getItem(storageKey)
    return value === 'light' || value === 'dark' || value === 'system' ? value : null
  } catch {
    return null
  }
}

function systemMode(): ColorMode {
  return isBrowser && window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** Disables transitions for one frame so a mode switch doesn't animate every color. */
function suppressTransitions(): () => void {
  const style = document.createElement('style')
  style.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.appendChild(style)
  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => style.remove())
  }
}

export function ColorModeProvider({
  children,
  defaultMode = 'system',
  storageKey = DEFAULT_STORAGE_KEY,
}: ColorModeOptions & { children: ReactNode }) {
  const [mode, setModeState] = useState<ColorModePreference>(
    () => readStoredMode(storageKey) ?? defaultMode,
  )
  const [system, setSystem] = useState<ColorMode>(systemMode)

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY)
    const onChange = () => setSystem(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const resolvedMode = mode === 'system' ? system : mode

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.mode === resolvedMode) return
    const restore = suppressTransitions()
    root.dataset.mode = resolvedMode
    root.style.colorScheme = resolvedMode
    restore()
  }, [resolvedMode])

  const setMode = useCallback(
    (next: ColorModePreference) => {
      setModeState(next)
      if (!storageKey) return
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be unavailable (private mode, blocked cookies); the mode still applies.
      }
    },
    [storageKey],
  )

  const value = useMemo(() => ({ mode, resolvedMode, setMode }), [mode, resolvedMode, setMode])
  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>
}

/** Read and change the color mode. */
export function useColorMode(): ColorModeContextValue {
  const value = useContext(ColorModeContext)
  if (!value) throw new Error('useColorMode must be used inside <GlyphProvider>.')
  return value
}

/**
 * Inline script that sets `data-mode` on `<html>` before first paint, so a dark-mode
 * visitor never sees a light flash. Put it in `<head>`.
 */
/** `<script>` element version of `getColorModeScript` for SSR frameworks. */
export function ColorModeScript(props: ColorModeOptions) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static script built from typed options
      dangerouslySetInnerHTML={{ __html: getColorModeScript(props) }}
      suppressHydrationWarning
    />
  )
}
