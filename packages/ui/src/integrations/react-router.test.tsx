import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation, useSearchParams } from 'react-router'
import { describe, expect, it } from 'vitest'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from '../components/navigation-menu'
import { AppShell, Navbar, Sidebar, SidebarContent, SidebarItem } from '../patterns/app-shell'
import { defaultTableState } from '../patterns/data-table/use-table-state'
import { useTableUrlState } from '../patterns/data-table/use-url-state'
import { GlyphProvider, type GlyphRouter } from '../provider'
import { matchPath, reactRouter, useRouterUrlAdapter } from './react-router'

function App({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <GlyphProvider router={reactRouter} storageKey={null}>
        {children}
      </GlyphProvider>
    </MemoryRouter>
  )
}

function Shell() {
  return (
    <AppShell
      layout="embedded"
      sidebar={
        <Sidebar>
          <SidebarContent>
            <SidebarItem href="/app" end>
              Dashboard
            </SidebarItem>
            <SidebarItem href="/app/invoices">Invoices</SidebarItem>
            <SidebarItem href="/app/settings" active={false}>
              Settings
            </SidebarItem>
          </SidebarContent>
        </Sidebar>
      }
    >
      <Routes>
        <Route path="*" element={<p>page</p>} />
      </Routes>
    </AppShell>
  )
}

const current = () =>
  screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent)

describe('matchPath', () => {
  it('matches the path and its children unless end is set', () => {
    expect(matchPath('/app/invoices', '/app/invoices')).toBe(true)
    expect(matchPath('/app/invoices', '/app/invoices/42')).toBe(true)
    expect(matchPath('/app/invoices', '/app/invoices-archive')).toBe(false)
    expect(matchPath('/app', '/app/invoices', { end: true })).toBe(false)
    expect(matchPath('/app/', '/app')).toBe(true)
  })

  it('treats the root as exact and ignores query strings', () => {
    expect(matchPath('/', '/pricing')).toBe(false)
    expect(matchPath('/', '/')).toBe(true)
    expect(matchPath('/app?tab=2', '/app')).toBe(true)
  })

  it('never matches hash, external or protocol links', () => {
    expect(matchPath('#pricing', '/')).toBe(false)
    expect(matchPath('https://example.com/app', '/app')).toBe(false)
    expect(matchPath('mailto:hi@example.com', '/')).toBe(false)
    expect(matchPath('', '/')).toBe(false)
  })
})

describe('reactRouter', () => {
  it('marks the current sidebar item, honoring end and explicit active', () => {
    render(
      <App path="/app/invoices/42">
        <Shell />
      </App>,
    )
    expect(current()).toEqual(['Invoices'])
  })

  it('lets an explicit active prop win over the router', () => {
    render(
      <App path="/app/settings">
        <Shell />
      </App>,
    )
    expect(current()).toEqual([])
  })

  it('navigates client-side and updates the active item', async () => {
    render(
      <App path="/app">
        <Shell />
      </App>,
    )
    expect(current()).toEqual(['Dashboard'])
    await userEvent.click(screen.getByRole('link', { name: 'Invoices' }))
    expect(current()).toEqual(['Invoices'])
  })

  it('marks Navbar and NavigationMenu links', () => {
    render(
      <App path="/pricing">
        <Navbar
          brand="Acme"
          links={[
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '/pricing' },
          ]}
        />
        <NavigationMenu>
          <NavigationMenuItem>
            <NavigationMenuLink href="/pricing">Plans</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenu>
      </App>,
    )
    expect(current()).toEqual(['Pricing', 'Plans'])
  })
})

describe('RouterLink', () => {
  it('keeps hash, external and mailto links as plain anchors', () => {
    render(
      <App path="/">
        <Navbar
          brand="Acme"
          links={[
            { label: 'Features', href: '#features' },
            { label: 'Blog', href: 'https://blog.example.com' },
            { label: 'Pricing', href: '/pricing' },
          ]}
        />
      </App>,
    )
    const [features, blog, pricing] = ['Features', 'Blog', 'Pricing'].map(
      (name) => screen.getAllByRole('link', { name })[0],
    )
    expect(features).toHaveAttribute('href', '#features')
    expect(blog).toHaveAttribute('href', 'https://blog.example.com')
    expect(pricing).toHaveAttribute('href', '/pricing')
  })
})

describe('GlyphProvider router prop', () => {
  it('accepts a custom router with only a Link', () => {
    const router: GlyphRouter = {
      Link: ({ href, ...props }) => <a data-custom href={href} {...props} />,
    }
    render(
      <GlyphProvider router={router} storageKey={null}>
        <Navbar brand="Acme" links={[{ label: 'Home', href: '/', active: true }]} />
      </GlyphProvider>,
    )
    const link = screen.getAllByRole('link', { name: 'Home' })[0]
    expect(link).toHaveAttribute('data-custom')
    expect(link).toHaveAttribute('aria-current', 'page')
  })
})

describe('useRouterUrlAdapter', () => {
  it('keeps table URL state and the router location in sync', async () => {
    const { result } = renderHook(
      () => {
        const url = useTableUrlState({ adapter: useRouterUrlAdapter() })
        const [params, setParams] = useSearchParams()
        return { url, params, setParams, location: useLocation() }
      },
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/invoices?q=INV-7&tab=all']}>{children}</MemoryRouter>
        ),
      },
    )
    expect(result.current.url.state.search).toBe('INV-7')

    await act(async () =>
      result.current.url.onStateChange(
        { ...defaultTableState, pagination: { pageIndex: 2, pageSize: 10 } },
        'pagination',
      ),
    )
    expect(result.current.location.search).toBe('?q=INV-7&tab=all&page=3')

    // A router navigation that keeps other params leaves the table's params alone.
    act(() =>
      result.current.setParams((params) => {
        params.set('new', '1')
        return params
      }),
    )
    expect(result.current.params.get('page')).toBe('3')
    expect(result.current.url.state.pagination?.pageIndex).toBe(2)
  })
})

describe('react-router regressions', () => {
  it('marks a relative href active once it resolves against the current route', () => {
    render(
      <MemoryRouter initialEntries={['/app/invoices']}>
        <GlyphProvider router={reactRouter} storageKey={null}>
          <Routes>
            <Route
              path="/app"
              element={
                <AppShell
                  layout="embedded"
                  sidebar={
                    <Sidebar>
                      <SidebarContent>
                        <SidebarItem href="invoices">Invoices</SidebarItem>
                        <SidebarItem href="settings">Settings</SidebarItem>
                      </SidebarContent>
                    </Sidebar>
                  }
                >
                  <p>Page</p>
                </AppShell>
              }
            >
              <Route path="invoices" element={null} />
              <Route path="settings" element={null} />
            </Route>
          </Routes>
        </GlyphProvider>
      </MemoryRouter>,
    )
    const links = screen.getAllByRole('link', { name: 'Invoices' })
    expect(links[0]).toHaveAttribute('href', '/app/invoices')
    expect(links[0]).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByRole('link', { name: 'Settings' })[0]).not.toHaveAttribute('aria-current')
  })

  it('keeps the location hash when table state is written to the URL', async () => {
    const { result } = renderHook(
      () => ({
        url: useTableUrlState({ adapter: useRouterUrlAdapter() }),
        location: useLocation(),
      }),
      {
        wrapper: ({ children }) => (
          <MemoryRouter initialEntries={['/invoices#activity']}>{children}</MemoryRouter>
        ),
      },
    )
    await act(async () =>
      result.current.url.onStateChange(
        { ...defaultTableState, pagination: { pageIndex: 1, pageSize: 10 } },
        'pagination',
      ),
    )
    expect(result.current.location.search).toBe('?page=2')
    expect(result.current.location.hash).toBe('#activity')
  })
})
