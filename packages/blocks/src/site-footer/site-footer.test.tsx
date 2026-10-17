import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SiteFooter } from './site-footer'

describe('SiteFooter', () => {
  it('renders labeled link columns and the bottom row', () => {
    render(
      <SiteFooter
        brand="Acme"
        columns={[{ title: 'Product', links: [{ label: 'Pricing', href: '/pricing' }] }]}
        copyright="© 2026 Acme"
      />,
    )
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Product' })).toContainElement(
      screen.getByRole('link', { name: 'Pricing' }),
    )
    expect(screen.getByText('© 2026 Acme')).toBeInTheDocument()
  })

  it('renders every link even when placeholders share an href', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <SiteFooter
        brand="Acme"
        columns={[
          {
            title: 'Company',
            links: [
              { label: 'About', href: '#' },
              { label: 'Careers', href: '#' },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Careers' })).toBeInTheDocument()
    expect(error.mock.calls.flat().join(' ')).not.toMatch(/same key/)
    error.mockRestore()
  })
})
