import type { MotionLevel, Theme } from '@glyphui/tokens'
import { Tooltip } from 'radix-ui'
import { lazy, type ReactNode, Suspense, useMemo } from 'react'
import { ConfirmProvider } from '../components/alert-dialog/confirm'
import type { ToasterProps } from '../components/toast/toast'
import { MotionRootAttribute, MotionScope } from '../motion/motion-root'
import { glyph } from '../themes'
import { type ColorModePreference, ColorModeProvider } from './color-mode'
import { GlyphContext, type GlyphRouter, type LinkComponent, neverActive } from './glyph-context'
import { ThemeStyle } from './theme-style'

// Only apps that turn on `toaster` load the toast UI.
const Toaster = lazy(() =>
  import('../components/toast/toast').then((m) => ({ default: m.Toaster })),
)

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
  /**
   * Overrides the theme's motion level everywhere, e.g. `"none"` in tests or for a user
   * setting. Visitors who ask for reduced motion never get animation either way.
   */
  motion?: MotionLevel
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
  motion,
}: GlyphProviderProps) {
  const Link = router?.Link ?? linkComponent ?? 'a'
  const useIsActive = router?.useIsActive ?? neverActive
  const value = useMemo(
    () => ({ theme, linkComponent: Link, useIsActive, motion }),
    [theme, Link, useIsActive, motion],
  )
  return (
    <ColorModeProvider
      {...(defaultMode !== undefined && { defaultMode })}
      {...(storageKey !== undefined && { storageKey })}
    >
      <GlyphContext.Provider value={value}>
        <ThemeStyle theme={theme} />
        <MotionRootAttribute />
        <MotionScope>
          <Tooltip.Provider delayDuration={300}>
            {/* useConfirm() works anywhere without setup; the dialog only mounts while open. */}
            <ConfirmProvider>
              {children}
              {toaster && (
                <Suspense fallback={null}>
                  <Toaster {...(toaster === true ? {} : toaster)} />
                </Suspense>
              )}
            </ConfirmProvider>
          </Tooltip.Provider>
        </MotionScope>
      </GlyphContext.Provider>
    </ColorModeProvider>
  )
}
