import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { SiteHeader } from './site-header'

/** Every page: the site header above whichever layout the route uses. */
export function SiteLayout() {
  const { pathname } = useLocation()
  // Start each page at the top. Keep the block body: newer Chrome returns a Promise from
  // scrollTo, and an effect must not return one.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on every route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  )
}
