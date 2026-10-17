import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlyphProvider } from '../../provider'
import { AppShell } from './app-shell'
import { Sidebar, SidebarContent, SidebarHeader, SidebarItem } from './sidebar'

describe('SidebarItem', () => {
  it('keeps its label for screen readers when the sidebar is collapsed', () => {
    render(
      <GlyphProvider storageKey={null}>
        <AppShell
          layout="embedded"
          defaultCollapsed
          sidebar={
            <Sidebar>
              <SidebarContent>
                <SidebarItem icon={<svg />}>Inbox</SidebarItem>
              </SidebarContent>
            </Sidebar>
          }
        >
          <p>Content</p>
        </AppShell>
      </GlyphProvider>,
    )
    expect(screen.getAllByRole('button', { name: 'Inbox' }).length).toBeGreaterThan(0)
    // Collapsing visually hides the label (sr-only), never removes it from the a11y tree.
    expect(screen.getByText('Inbox').className).toContain('sidebar:sr-only')
    expect(screen.getByText('Inbox').className).not.toMatch(/sidebar:hidden/)
  })
})

// Relay finding U5: a fixed-height header clipped a workspace switcher placed under the brand.
describe('SidebarHeader', () => {
  it('grows with its content instead of clipping it', () => {
    render(
      <GlyphProvider storageKey={null}>
        <SidebarHeader data-testid="header">
          <span>Relay</span>
          <button type="button">Acme workspace</button>
        </SidebarHeader>
      </GlyphProvider>,
    )
    const header = screen.getByTestId('header')
    expect(header).toHaveClass('min-h-14')
    expect(header).not.toHaveClass('h-14')
  })
})
