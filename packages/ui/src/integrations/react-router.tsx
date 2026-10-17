import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { UrlAdapter } from '../patterns/data-table/use-url-state'
import type { GlyphRouter, IsActiveOptions, LinkComponentProps } from '../provider/glyph-context'

const isOutsideApp = (href: string) =>
  href.startsWith('#') || href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)

/**
 * React Router's `Link`, taking Glyph's `href` prop. Hash links, external URLs and `mailto:`
 * stay plain anchors, so in-page anchors scroll and external links leave the app.
 */
export function RouterLink({ href, ...props }: LinkComponentProps) {
  if (isOutsideApp(href)) return <a href={href} {...props} />
  return <Link to={href} {...props} />
}

const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/** Whether an in-app `href` matches a pathname, with React Router's `NavLink` semantics. */
export function matchPath(href: string, pathname: string, { end = false }: IsActiveOptions = {}) {
  // Hash links, external URLs and protocol links never mark an item active.
  if (!href || isOutsideApp(href)) return false
  const target = trimSlash(new URL(href, 'http://glyph.local').pathname)
  const current = trimSlash(pathname)
  if (end || target === '/') return current === target
  return current === target || current.startsWith(`${target}/`)
}

/** Marks a link active when the current location matches it, like React Router's `NavLink`. */
export function useRouterIsActive(href: string, options?: IsActiveOptions): boolean {
  const { pathname } = useLocation()
  return matchPath(href, pathname, options)
}

/**
 * Connects Glyph's navigation to React Router (v7 or later):
 * `<GlyphProvider router={reactRouter}>`. Links render client-side, and Sidebar, Navbar
 * and NavigationMenu items mark the current page automatically. Must render inside a router.
 */
export const reactRouter: GlyphRouter = { Link: RouterLink, useIsActive: useRouterIsActive }

/**
 * Reads and writes table URL state through React Router, so the router's location (and
 * `useSearchParams`) always agree with the table:
 *
 * ```tsx
 * const url = useTableUrlState({ adapter: useRouterUrlAdapter() })
 * ```
 */
export function useRouterUrlAdapter(): UrlAdapter {
  const location = useLocation()
  const navigate = useNavigate()
  const current = useRef(location.search)
  current.current = location.search
  const listeners = useRef(new Set<() => void>())

  // biome-ignore lint/correctness/useExhaustiveDependencies: notify subscribers whenever the search changes
  useEffect(() => {
    for (const listener of listeners.current) listener()
  }, [location.search])

  return useMemo(
    () => ({
      getSearch: () => current.current,
      setSearch: (search, mode) => {
        current.current = search
        navigate({ search }, { replace: mode === 'replace', preventScrollReset: true })
      },
      subscribe: (onChange) => {
        listeners.current.add(onChange)
        return () => {
          listeners.current.delete(onChange)
        }
      },
    }),
    [navigate],
  )
}
