import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from '../components/navigation-menu'
import { AppShell, Navbar, Sidebar, SidebarContent, SidebarItem } from '../patterns/app-shell'
import { GlyphProvider, type GlyphRouter } from '../provider'
import { matchPath, reactRouter } from './react-router'

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
