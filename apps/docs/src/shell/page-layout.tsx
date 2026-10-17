import { Outlet } from 'react-router'
import { SiteFooter } from './site-footer'

/** Full-width pages (home, blocks, themes, templates): content, then the site footer. */
export function PageLayout() {
  return (
    <>
      <main id="main" className="min-w-0">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
