import type { MotionLevel, Theme } from '@glyphui/tokens'
import {
  createContext,
  type ElementType,
  type MouseEventHandler,
  type ReactNode,
  useContext,
} from 'react'

/** Props Glyph passes to your router's link component. */
export interface LinkComponentProps {
  href: string
  className?: string
  children?: ReactNode
  onClick?: MouseEventHandler<HTMLAnchorElement>
  'aria-current'?: 'page' | undefined
}

/**
 * Any component that renders a link from these props. Plain `'a'` by default.
 * React Router: `({ href, ...props }) => <Link to={href} {...props} />`
 */
export type LinkComponent = ElementType<LinkComponentProps>

export interface IsActiveOptions {
  /** Match only this exact path, not its children. Default false. */
  end?: boolean
}

/**
 * A hook that reports whether `href` is the current location. Glyph calls it once per
 * navigation item on every render, so it must follow the rules of hooks.
 */
export type UseIsActive = (href: string, options?: IsActiveOptions) => boolean

/** Connects Glyph's navigation components to your router. */
export interface GlyphRouter {
  /** Renders links client-side. */
  Link: LinkComponent
  /** Marks Sidebar, Navbar and NavigationMenu items active automatically. */
  useIsActive?: UseIsActive
}

export interface GlyphContextValue {
  theme: Theme
  linkComponent: LinkComponent
  useIsActive: UseIsActive
  /** Overrides the theme's motion level for the whole app. */
  motion?: MotionLevel | undefined
}

export const GlyphContext = createContext<GlyphContextValue | null>(null)

/** The active theme and app-level settings. Must be used under `GlyphProvider`. */
export function useGlyph(): GlyphContextValue {
  const value = useContext(GlyphContext)
  if (!value) throw new Error('useGlyph must be used inside <GlyphProvider>.')
  return value
}

/** The router-aware link component configured on `GlyphProvider`. */
export function useLinkComponent(): LinkComponent {
  return useContext(GlyphContext)?.linkComponent ?? 'a'
}

export const neverActive: UseIsActive = () => false

/**
 * Whether `href` is the current page, using the router passed to `GlyphProvider`.
 * Returns `explicit` when it is set, so an `active` prop always wins.
 */
export function useIsActive(
  href: string | undefined,
  options?: IsActiveOptions & { explicit?: boolean | undefined },
): boolean {
  const isActive = useContext(GlyphContext)?.useIsActive ?? neverActive
  const { explicit, ...matchOptions } = options ?? {}
  // Always call the router hook so the hook order never changes between renders.
  const matched = isActive(href ?? '', matchOptions)
  if (explicit !== undefined) return explicit
  return href ? matched : false
}
