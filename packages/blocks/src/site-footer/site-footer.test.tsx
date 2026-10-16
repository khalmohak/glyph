import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
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
})
