import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Newsletter } from './newsletter'

describe('Newsletter', () => {
  it('rejects an invalid email without calling onSubscribe', async () => {
    const onSubscribe = vi.fn()
    render(<Newsletter title="News" onSubscribe={onSubscribe} />)
    await userEvent.type(screen.getByLabelText('Email address'), 'nope')
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
    expect(onSubscribe).not.toHaveBeenCalled()
  })

  it('shows success after subscribing, and the error message when it fails', async () => {
    const onSubscribe = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Rate limited'))
    render(<Newsletter title="News" onSubscribe={onSubscribe} />)
    const input = screen.getByLabelText('Email address')
    await userEvent.type(input, 'a@b.co')
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(await screen.findByRole('status')).toHaveTextContent('subscribed')
    expect(onSubscribe).toHaveBeenCalledWith('a@b.co')
    await userEvent.type(input, 'c@d.co')
    await userEvent.click(screen.getByRole('button', { name: 'Subscribe' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Rate limited')
  })
})
