import type { Theme } from '@glyphui/tokens'
import { Tooltip } from 'radix-ui'
import { type ReactNode, useMemo } from 'react'
import { ConfirmProvider } from '../components/alert-dialog/confirm'
import { Toaster, type ToasterProps } from '../components/toast/toast'
import { glyph } from '../themes'
import { type ColorModePreference, ColorModeProvider } from './color-mode'
import { GlyphContext, type GlyphRouter, type LinkComponent, neverActive } from './glyph-context'
import { ThemeStyle } from './theme-style'

export interface GlyphProviderProps {
  children: ReactNode
  /** The theme for the whole app. Defaults to the `glyph` preset. */
  theme?: Theme
  /** Color mode used until the user picks one. */
  defaultMode?: ColorModePreference
  /** localStorage key for the user's color mode. `null` disables persistence. */
  storageKey?: string | null
  /**
   * Your router: its link component, plus an optional `useIsActive` hook that marks the
   * current page in Sidebar, Navbar and NavigationMenu. React Router:
   * `import { reactRouter } from '@glyphui/ui/react-router'`.
   */
  router?: GlyphRouter
  /** Your router's link only. Prefer `router`, which also handles active items. */
  linkComponent?: LinkComponent
  /**
   * Mounts a themed `<Toaster />` so `toast()` works anywhere. `true` for defaults, or pass
   * Toaster props (e.g. `{ position: 'top-center' }`). Off by default.
   */
  toaster?: boolean | ToasterProps
}

/** Provides the theme, color mode, tooltips, `useConfirm()` and (optionally) toasts. Render once at the root. */
export function GlyphProvider({
  children,
  theme = glyph,
  defaultMode,
  storageKey,
  router,
  linkComponent,
  toaster = false,
}: GlyphProviderProps) {
  const Link = router?.Link ?? linkComponent ?? 'a'
  const useIsActive = router?.useIsActive ?? neverActive
  const value = useMemo(
    () => ({ theme, linkComponent: Link, useIsActive }),
    [theme, Link, useIsActive],
  )
  return (
    <ColorModeProvider
      {...(defaultMode !== undefined && { defaultMode })}
      {...(storageKey !== undefined && { storageKey })}
    >
      <GlyphContext.Provider value={value}>
        <ThemeStyle theme={theme} />
        <Tooltip.Provider delayDuration={300}>
          {/* useConfirm() works anywhere without setup; the dialog only mounts while open. */}
          <ConfirmProvider>
            {children}
            {toaster && <Toaster {...(toaster === true ? {} : toaster)} />}
          </ConfirmProvider>
        </Tooltip.Provider>
      </GlyphContext.Provider>
    </ColorModeProvider>
  )
}
