import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  createColumnHelper,
  DataTable,
  type DataTableState,
  getFilterList,
  parseTableSearch,
} from './index'

interface Invoice {
  id: string
  status: string
  total: number
  memo: string
}

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('status', {
    header: 'Status',
    meta: {
      filter: {
        type: 'multi',
        options: [
          { value: 'open', label: 'Open' },
          { value: 'overdue', label: 'Overdue' },
        ],
      },
    },
  }),
  col.accessor('total', { header: 'Total', meta: { filter: { type: 'range' } } }),
  col.accessor('memo', { header: 'Memo', meta: { filter: { type: 'text' } } }),
]

describe('URL filters decode by column filter type', () => {
  it('decodes a single multi value from a deep link as an array', () => {
    const state = parseTableSearch('?f.status=overdue&f.total=10..&f.memo=a..b', { columns })
    expect(state.columnFilters).toEqual([
      { id: 'status', value: ['overdue'] },
      { id: 'total', value: { min: 10 } },
      // A text filter keeps "a..b" as text instead of reading it as a range.
      { id: 'memo', value: 'a..b' },
    ])
  })

  it('getFilterList always returns an array', () => {
    expect(getFilterList([{ id: 'status', value: 'overdue' }], 'status')).toEqual(['overdue'])
    expect(getFilterList([{ id: 'status', value: ['a', 'b'] }], 'status')).toEqual(['a', 'b'])
    expect(getFilterList([], 'status')).toEqual([])
  })

  it('DataTable reports multi filters as arrays even when given a string', async () => {
    const onStateChange = vi.fn()
    render(
      <DataTable
        aria-label="Invoices"
        data={[{ id: 'INV-1', status: 'overdue', total: 5, memo: '' }]}
        columns={columns}
        defaultState={{ columnFilters: [{ id: 'status', value: 'overdue' }] }}
        onStateChange={onStateChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Invoice/ }))
    expect(onStateChange).toHaveBeenCalled()
    const [next] = onStateChange.mock.lastCall as [DataTableState]
    expect(next.columnFilters).toEqual([{ id: 'status', value: ['overdue'] }])
  })
})
