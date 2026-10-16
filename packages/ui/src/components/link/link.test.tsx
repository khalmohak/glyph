import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GlyphProvider, type LinkComponentProps } from '../../provider'
import { Link } from './link'

describe('Link', () => {
  it('renders an internal link through the provider link component', () => {
    const RouterLink = ({ href, ...props }: LinkComponentProps) => (
      <a data-router="yes" href={`/app${href}`} {...props} />
    )
    render(
      <GlyphProvider linkComponent={RouterLink} storageKey={null}>
        <Link href="/settings">Settings</Link>
      </GlyphProvider>,
    )
    const link = screen.getByRole('link', { name: 'Settings' })
    expect(link).toHaveAttribute('href', '/app/settings')
    expect(link).toHaveAttribute('data-router', 'yes')
  })

  it('opens external links in a new tab safely and announces it', () => {
    render(
      <Link href="https://example.com" external>
        Example
      </Link>,
    )
    const link = screen.getByRole('link', { name: /Example/ })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAccessibleName('Example (opens in a new tab)')
  })
})
