import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../components/button'
import { GlyphProvider } from '../../provider'
import { AppShell } from './app-shell'
import { Navbar } from './navbar'
import { Sidebar, SidebarContent, SidebarItem } from './sidebar'

/** A matchMedia whose min-width queries follow a width we control. */
function mockViewport(width: number) {
  const listeners = new Set<() => void>()
  let current = width
  window.matchMedia = ((query: string) => {
    const min = /min-width:\s*(\d+)px/.exec(query)
    const max = /max-width:\s*(\d+)px/.exec(query)
    const list = {
      media: query,
      get matches() {
        if (min) return current >= Number(min[1])
        if (max) return current <= Number(max[1])
        return false
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      addListener: (fn: () => void) => listeners.add(fn),
      removeListener: (fn: () => void) => listeners.delete(fn),
      dispatchEvent: () => false,
      onchange: null,
    }
    return list as unknown as MediaQueryList
  }) as typeof window.matchMedia
  return (next: number) => {
    current = next
    for (const fn of listeners) fn()
  }
}

describe('AppShell', () => {
  const original = window.matchMedia
  afterEach(() => {
    window.matchMedia = original
  })

  it('closes the navigation drawer when the window grows to desktop width', async () => {
    const resize = mockViewport(500)
    render(
      <GlyphProvider storageKey={null} motion="none">
        <AppShell
          layout="embedded"
          sidebar={
            <Sidebar>
              <SidebarContent>
                <SidebarItem>Inbox</SidebarItem>
              </SidebarContent>
            </Sidebar>
          }
        >
          <p>Page</p>
        </AppShell>
      </GlyphProvider>,
    )
    await userEvent.click(screen.getAllByRole('button', { name: /navigation/i })[0]!)
    expect(screen.getByRole('dialog', { name: 'Navigation' })).toBeInTheDocument()
    act(() => resize(1200))
    expect(screen.queryByRole('dialog', { name: 'Navigation' })).not.toBeInTheDocument()
  })
})

describe('Navbar', () => {
  it('closes the menu panel when one of its actions is used', async () => {
    const onSignIn = vi.fn()
    render(
      <GlyphProvider storageKey={null} motion="none">
        <Navbar
          brand="Acme"
          links={[{ label: 'Pricing', href: '#pricing' }]}
          actions={<Button onClick={onSignIn}>Sign in</Button>}
        />
      </GlyphProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const panel = screen.getByRole('dialog')
    await userEvent.click(within(panel).getByRole('button', { name: 'Sign in' }))
    expect(onSignIn).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders links that share an href without key warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <GlyphProvider storageKey={null} motion="none">
        <Navbar
          brand="Acme"
          links={[
            { label: 'Docs', href: '#' },
            { label: 'Blog', href: '#' },
          ]}
        />
      </GlyphProvider>,
    )
    expect(screen.getAllByRole('link', { name: /Docs|Blog/ })).toHaveLength(2)
    expect(error.mock.calls.filter(([message]) => /same key/.test(String(message)))).toEqual([])
    error.mockRestore()
  })
})
