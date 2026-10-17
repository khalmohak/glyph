import {
  AppShell,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarItem,
  SidebarSection,
  SidebarTrigger,
  Text,
} from '@glyphui/ui'
import { History, LayoutGrid, Palette, Shapes } from 'lucide-react'
import { Outlet, useLocation, useMatches } from 'react-router'
import { StatusBadge } from '../components/status-badge'
import { isNew } from '../lib/added'
import { docs, docsByCategory } from '../lib/catalog'
import { guides } from '../lib/site'
import { Brand } from './brand'

/** Route `handle` for pages that use the full content width (the gallery). */
export interface DocsRouteHandle {
  wide?: boolean
}

/**
 * Docs and component pages: Glyph's AppShell with a sidebar that follows the section. The
 * site header sits above it, so the sidebar and the mobile bar stick just below the header.
 */
export function DocsLayout() {
  const { pathname } = useLocation()
  const matches = useMatches()
  const wide = matches.some((m) => (m.handle as DocsRouteHandle | undefined)?.wide)
  const section =
    pathname.startsWith('/docs') || pathname === '/getting-started' ? 'docs' : 'components'

  return (
    <AppShell
      sidebar={<DocsSidebar section={section} pathname={pathname} />}
      mobileBrand={
        <Text size="small" weight="medium">
          {section === 'docs' ? 'Guides' : 'Components'}
        </Text>
      }
      className={[
        // Below the 4rem site header instead of at the very top.
        '[&>div:first-child]:top-16 [&>div:first-child]:h-[calc(100dvh-4rem)]',
        '[&_[data-slot=app-shell-main]>div:first-child]:top-16',
      ].join(' ')}
    >
      <div className="hidden px-4 pt-4 md:block sm:px-8 lg:px-10">
        <SidebarTrigger />
      </div>
      <main
        id="main"
        className={[
          'mx-auto w-full min-w-0 px-4 pt-6 pb-24 sm:px-8 lg:px-10',
          wide ? 'max-w-7xl' : 'max-w-5xl',
        ].join(' ')}
      >
        <Outlet />
      </main>
    </AppShell>
  )
}

function CountLabel({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-baseline justify-between gap-2">
      <span className="truncate">{label}</span>
      <span className="tabular-nums">{count}</span>
    </span>
  )
}

function newBadge(slug: string, status: string) {
  if (isNew(slug))
    return (
      <span className="font-sans text-caption font-medium text-primary-text" title="New">
        new
      </span>
    )
  return status === 'beta' ? 'beta' : undefined
}

function DocsSidebar({ section, pathname }: { section: 'docs' | 'components'; pathname: string }) {
  return (
    <Sidebar>
      <SidebarContent aria-label={section === 'docs' ? 'Guides' : 'Components'}>
        <div className="px-2 pb-1 md:hidden">
          <Brand />
        </div>
        {section === 'docs' ? (
          <>
            <SidebarSection label="Guides">
              <SidebarItem href="/docs" end>
                Overview
              </SidebarItem>
              {guides.map((guide) => (
                <SidebarItem
                  key={guide.slug}
                  href={`/docs/${guide.slug}`}
                  active={
                    pathname === `/docs/${guide.slug}` ||
                    (guide.slug === 'getting-started' && pathname === '/getting-started')
                  }
                >
                  {guide.title}
                </SidebarItem>
              ))}
            </SidebarSection>
            <SidebarSection label="Reference">
              <SidebarItem href="/components" icon={<LayoutGrid />} end>
                Components
              </SidebarItem>
              <SidebarItem href="/themes" icon={<Palette />}>
                Theme studio
              </SidebarItem>
              <SidebarItem href="/changelog" icon={<History />}>
                Changelog
              </SidebarItem>
            </SidebarSection>
          </>
        ) : (
          <>
            <SidebarSection>
              <SidebarItem
                href="/components"
                icon={<LayoutGrid />}
                end
                badge={<span className="tabular-nums">{docs.length}</span>}
              >
                All components
              </SidebarItem>
              <SidebarItem href="/blocks" icon={<Shapes />}>
                Blocks
              </SidebarItem>
            </SidebarSection>
            {docsByCategory().map(({ category, items }) => (
              <SidebarSection
                key={category}
                label={<CountLabel label={category} count={items.length} />}
              >
                {items.map((doc) => (
                  <SidebarItem
                    key={doc.slug}
                    href={`/components/${doc.slug}`}
                    badge={newBadge(doc.slug, doc.status)}
                  >
                    {doc.name}
                  </SidebarItem>
                ))}
              </SidebarSection>
            ))}
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsed=true]/sidebar:hidden">
        <Text size="caption" tone="muted" className="flex items-center gap-2">
          <StatusBadge status="beta" /> may still change
        </Text>
      </SidebarFooter>
    </Sidebar>
  )
}
