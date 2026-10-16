import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert } from './alert'

describe('Alert', () => {
  it('announces danger and warning immediately, other tones politely', () => {
    const { rerender } = render(<Alert tone="danger" title="Payment failed" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Payment failed')
    rerender(<Alert tone="warning" title="Trial ends soon" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    rerender(<Alert tone="success" title="Saved" />)
    expect(screen.getByRole('status')).toHaveTextContent('Saved')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders title, description and action', () => {
    render(
      <Alert title="Update available" action={<button type="button">Install</button>}>
        Version 2.0 is ready.
      </Alert>,
    )
    expect(screen.getByText('Version 2.0 is ready.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument()
  })

  it('shows a dismiss button only when onDismiss is set', async () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<Alert title="Note" />)
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument()
    rerender(<Alert title="Note" onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('hides the icon when icon is false', () => {
    const { container } = render(<Alert title="Plain" icon={false} />)
    expect(container.querySelector('[data-slot="alert-icon"]')).toBeNull()
  })
})
