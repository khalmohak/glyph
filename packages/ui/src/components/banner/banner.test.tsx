import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Banner } from './banner'

describe('Banner', () => {
  afterEach(() => window.localStorage.clear())

  it('renders an announcement region with its content', () => {
    render(<Banner>We ship v2 on Monday.</Banner>)
    expect(screen.getByRole('region', { name: 'Announcement' })).toHaveTextContent(
      'We ship v2 on Monday.',
    )
  })

  it('hides itself when dismissed and calls onDismiss', async () => {
    const onDismiss = vi.fn()
    render(
      <Banner dismissible onDismiss={onDismiss}>
        Maintenance tonight
      </Banner>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('Maintenance tonight')).not.toBeInTheDocument()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('remembers the dismissal when storageKey is set', async () => {
    const { unmount } = render(
      <Banner dismissible storageKey="promo">
        Promo
      </Banner>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    unmount()
    render(
      <Banner dismissible storageKey="promo">
        Promo
      </Banner>,
    )
    expect(screen.queryByText('Promo')).not.toBeInTheDocument()
  })
})
