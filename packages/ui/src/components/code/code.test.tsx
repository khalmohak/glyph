import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Code, CodeBlock } from './code'

describe('Code', () => {
  it('renders inline code', () => {
    render(<Code>pnpm dev</Code>)
    expect(screen.getByText('pnpm dev').tagName).toBe('CODE')
  })
})

describe('CodeBlock', () => {
  it('shows the title and copies the code', async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue()
    render(<CodeBlock title="install.sh" code="pnpm add @glyphui/ui" />)
    expect(screen.getByText('install.sh')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(writeText).toHaveBeenCalledWith('pnpm add @glyphui/ui')
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })

  it('keeps working when the clipboard is unavailable', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'))
    render(<CodeBlock code="echo hi" />)
    await user.click(screen.getByRole('button', { name: 'Copy code' }))
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument()
  })

  it('hides the copy button when copyable is false', () => {
    render(<CodeBlock code="x" copyable={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
