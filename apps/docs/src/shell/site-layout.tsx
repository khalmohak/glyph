import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { getDoc } from '../lib/catalog'
import { componentTitle, HOME_TITLE, SITE_NAME, staticRoutes } from '../lib/site'
import { SiteHeader } from './site-header'

/** The prerendered title of a route, so the tab and history match after client navigation. */
function titleOf(pathname: string): string {
  const path = pathname.replace(/^\/+|\/+$/g, '')
  if (!path) return HOME_TITLE
  const route = staticRoutes.find((r) => r.path === path)
  if (route) return route.title
  const doc = path.startsWith('components/') ? getDoc(path.slice('components/'.length)) : undefined
  return doc ? componentTitle(doc.name, doc.status === 'planned') : SITE_NAME
}

/** Every page: the site header above whichever layout the route uses. */
export function SiteLayout() {
  const { pathname } = useLocation()
  // Start each page at the top. Keep the block body: newer Chrome returns a Promise from
  // scrollTo, and an effect must not return one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on every route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.title = titleOf(pathname)
  }, [pathname])

  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  )
}
