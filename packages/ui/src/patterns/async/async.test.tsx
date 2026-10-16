import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Async } from './async'

describe('Async', () => {
  it('renders each state', () => {
    const view = (result: Parameters<typeof Async<string[]>>[0]['result']) => (
      <Async result={result}>{(items) => <p>{items.join(', ')}</p>}</Async>
    )
    const { rerender } = render(view({ status: 'pending' }))
    expect(screen.getByRole('status')).toHaveTextContent('Loading')

    rerender(view({ status: 'error', error: new Error('Offline') }))
    expect(screen.getByRole('alert')).toHaveTextContent('Offline')

    rerender(view({ status: 'success', data: [] }))
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()

    rerender(view({ status: 'success', data: ['a', 'b'] }))
    expect(screen.getByText('a, b')).toBeInTheDocument()
  })
})
