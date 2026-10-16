import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders links for ancestors and marks the last item as the current page', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Glyph' },
        ]}
      />,
    )
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
    expect(screen.getByText('Glyph')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Glyph' })).not.toBeInTheDocument()
  })

  it('hides separators from assistive technology', () => {
    const { container } = render(
      <Breadcrumb items={[{ label: 'A', href: '/a' }, { label: 'B' }]} />,
    )
    const separators = container.querySelectorAll('[data-slot=breadcrumb-separator]')
    expect(separators).toHaveLength(1)
    expect(separators[0]).toHaveAttribute('aria-hidden', 'true')
  })
})
