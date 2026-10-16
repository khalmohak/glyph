import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CopyButton } from './copy-button'

describe('CopyButton', () => {
  it('copies the value and confirms it', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(
      <CopyButton value="npm install @glyphui/ui" onCopy={onCopy}>
        Copy command
      </CopyButton>,
    )
    await user.click(screen.getByRole('button', { name: /Copy command/ }))
    expect(await navigator.clipboard.readText()).toBe('npm install @glyphui/ui')
    expect(onCopy).toHaveBeenCalledWith('npm install @glyphui/ui')
    expect(screen.getByRole('status')).toHaveTextContent('Copied')
    expect(screen.getByRole('button')).toHaveAttribute('data-copied', 'true')
  })

  it('is icon-only with an accessible name when it has no label', async () => {
    const user = userEvent.setup()
    render(<CopyButton value="sk_live_123" />)
    const button = screen.getByRole('button', { name: 'Copy' })
    await user.click(button)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })
})
