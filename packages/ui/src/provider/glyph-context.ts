import type { Theme } from '@glyphkit/tokens'
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

export interface GlyphContextValue {
  theme: Theme
  linkComponent: LinkComponent
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
