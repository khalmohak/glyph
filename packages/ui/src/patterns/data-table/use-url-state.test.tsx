import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultTableState } from './use-table-state'
import { parseTableSearch, useTableUrlState, writeTableSearch } from './use-url-state'

describe('URL serialization', () => {
  it('round-trips every slice', () => {
    const state = {
      pagination: { pageIndex: 2, pageSize: 25 },
      sorting: [
        { id: 'total', desc: true },
        { id: 'customer', desc: false },
      ],
      search: 'acme co',
      columnFilters: [
        { id: 'status', value: ['paid', 'open'] },
        { id: 'plan', value: 'pro' },
        { id: 'total', value: { min: 100, max: 500 } },
        { id: 'issued', value: { from: '2026-01-01', to: '2026-02-01' } },
        { id: 'amount', value: { min: 5 } },
      ],
      columnVisibility: { email: false, phone: false, name: true },
    }
    const search = writeTableSearch('?tab=invoices', state)
    expect(search).toContain('tab=invoices')
    expect(search).toContain('page=3')
    expect(search).toContain('sort=total.desc%2Ccustomer')
    expect(parseTableSearch(search)).toEqual({
      ...state,
      columnVisibility: { email: false, phone: false },
    })
  })

  it('omits defaults and supports a prefix', () => {
    const search = writeTableSearch(
      '',
      { pagination: { pageIndex: 0, pageSize: 10 }, sorting: [], search: '' },
      { prefix: 'inv' },
    )
    expect(search).toBe('')
    const page2 = writeTableSearch(
      '',
      { pagination: { pageIndex: 1, pageSize: 10 } },
      { prefix: 'inv' },
    )
    expect(page2).toBe('?inv.page=2')
    expect(parseTableSearch(page2, { prefix: 'inv' }).pagination).toEqual({
      pageIndex: 1,
      pageSize: 10,
    })
    expect(parseTableSearch(page2).pagination?.pageIndex).toBe(0)
  })

  it('ignores junk values', () => {
    expect(parseTableSearch('?page=abc&size=-4').pagination).toEqual({ pageIndex: 0, pageSize: 10 })
  })
})

describe('useTableUrlState', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
    vi.useRealTimers()
  })

  it('reads the URL, writes changes, and follows the back button', async () => {
    window.history.replaceState(null, '', '/invoices?page=2&sort=total.desc')
    const { result } = renderHook(() => useTableUrlState())
    expect(result.current.state.pagination?.pageIndex).toBe(1)
    expect(result.current.state.sorting).toEqual([{ id: 'total', desc: true }])

    const length = window.history.length
    await act(async () =>
      result.current.onStateChange(
        { ...defaultTableState, pagination: { pageIndex: 3, pageSize: 10 } },
        'pagination',
      ),
    )
    expect(window.location.search).toBe('?page=4&sort=total.desc')
    expect(window.history.length).toBe(length + 1)
    expect(result.current.state.pagination?.pageIndex).toBe(3)

    act(() => {
      window.history.replaceState(null, '', '/invoices?page=2&sort=total.desc')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.state.pagination?.pageIndex).toBe(1)
  })

  it('shows typed search at once and writes it to the URL after a pause', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTableUrlState({ searchDebounce: 200 }))
    act(() => result.current.onStateChange({ ...defaultTableState, search: 'glo' }, 'search'))
    expect(result.current.state.search).toBe('glo')
    expect(window.location.search).toBe('')
    await act(async () => vi.advanceTimersByTime(250))
    expect(window.location.search).toBe('?q=glo')
    expect(result.current.state.search).toBe('glo')
  })

  it('writes the changes of one action as one history entry', async () => {
    const { result } = renderHook(() => useTableUrlState())
    const length = window.history.length
    await act(async () => {
      const sorted = { ...defaultTableState, sorting: [{ id: 'total', desc: false }] }
      result.current.onStateChange(sorted, 'sorting')
      result.current.onStateChange(
        { ...sorted, columnVisibility: { email: false } },
        'columnVisibility',
      )
    })
    expect(window.location.search).toBe('?sort=total&hide=email')
    expect(window.history.length).toBe(length + 1)
  })

  it('resets only its own parameters', () => {
    window.history.replaceState(null, '', '/?tab=a&page=3&f.status=paid&q=x')
    const { result } = renderHook(() => useTableUrlState())
    act(() => result.current.reset())
    expect(window.location.search).toBe('?tab=a')
  })

  it('ignores slices it does not manage', async () => {
    const { result } = renderHook(() => useTableUrlState({ slices: ['pagination'] }))
    await act(async () =>
      result.current.onStateChange(
        { ...defaultTableState, sorting: [{ id: 'a', desc: false }] },
        'sorting',
      ),
    )
    expect(window.location.search).toBe('')
  })
})
