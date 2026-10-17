import { act, fireEvent, render, screen } from '@testing-library/react'
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

  it('subscribes once while a request is in flight', async () => {
    let finish = () => {}
    const onSubscribe = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    const { container } = render(<Newsletter title="News" onSubscribe={onSubscribe} />)
    await userEvent.type(screen.getByLabelText('Email address'), 'a@b.co')
    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(onSubscribe).toHaveBeenCalledTimes(1)
    await act(async () => finish())
  })
})
