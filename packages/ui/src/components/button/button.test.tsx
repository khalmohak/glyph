import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GlyphProvider } from '../../provider'
import { brutalist } from '../../themes'
import { Button, IconButton } from './button'

describe('Button', () => {
  it('renders a type="button" by default and handles clicks', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled and busy while loading', () => {
    render(<Button loading>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('renders its child with button styles when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/docs">Docs</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('data-slot', 'button')
    expect(link).not.toHaveAttribute('type')
  })

  it('applies theme component overrides before the call-site className', () => {
    render(
      <GlyphProvider theme={brutalist}>
        <Button className="normal-case">Go</Button>
      </GlyphProvider>,
    )
    const cls = screen.getByRole('button', { name: 'Go' }).className
    expect(cls).toContain('tracking-wide')
    expect(cls).toContain('normal-case')
    expect(cls).not.toMatch(/(^|\s)uppercase(\s|$)/)
  })

  it('IconButton requires and exposes an accessible name', () => {
    render(<IconButton icon={<svg />} aria-label="Close" />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })
})

describe('Button iconOnly with asChild', () => {
  it('merges button props onto the child link and keeps its icon', () => {
    render(
      <Button iconOnly asChild variant="ghost">
        <a href="https://github.com" aria-label="GitHub">
          <svg data-testid="icon" />
        </a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'GitHub' })
    expect(link).toHaveAttribute('data-slot', 'button')
    expect(within(link).getByTestId('icon')).toBeInTheDocument()
  })
})
