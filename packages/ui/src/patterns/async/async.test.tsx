import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Async, useAsync } from './async'

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

describe('useAsync', () => {
  it('ignores a response that arrives after a newer one', async () => {
    const resolvers: Record<string, (value: string) => void> = {}
    const load = (key: string) => new Promise<string>((resolve) => (resolvers[key] = resolve))
    const { result, rerender } = renderHook(({ key }) => useAsync(() => load(key), [key]), {
      initialProps: { key: 'a' },
    })
    rerender({ key: 'b' })
    await act(async () => resolvers.b?.('second'))
    await act(async () => resolvers.a?.('first'))
    expect(result.current).toMatchObject({ status: 'success', data: 'second' })
  })

  it('reports a function that throws before returning a promise as an error', async () => {
    const { result } = renderHook(() =>
      useAsync(() => {
        throw new Error('Bad input')
      }, []),
    )
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect((result.current.error as Error).message).toBe('Bad input')
  })

  it('runs again on refetch', async () => {
    let calls = 0
    const { result } = renderHook(() => useAsync(async () => ++calls, []))
    await waitFor(() => expect(result.current.data).toBe(1))
    act(() => {
      result.current.refetch?.()
    })
    await waitFor(() => expect(result.current.data).toBe(2))
  })
})
