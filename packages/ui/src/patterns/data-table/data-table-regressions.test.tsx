import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GlyphProvider } from '../../provider/glyph-provider'
import { createColumnHelper, DataTable, type DataTableProps } from './index'

interface Invoice {
  id: string
  customer: string
  total: number
}

const invoices: Invoice[] = Array.from({ length: 40 }, (_, i) => ({
  id: `INV-${100 + i}`,
  customer: ['Northwind', 'Globex', 'Initech'][i % 3]!,
  total: (i + 1) * 10,
}))

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', { header: 'Customer', meta: { filter: { type: 'text' } } }),
  col.accessor('total', { header: 'Total' }),
]

function wrap(children: ReactNode) {
  return (
    <GlyphProvider storageKey={null} motion="none">
      {children}
    </GlyphProvider>
  )
}

function table(props: Partial<DataTableProps<Invoice>>) {
  return wrap(
    <DataTable
      aria-label="Invoices"
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      {...props}
    />,
  )
}

const bodyRows = () =>
  within(
    within(screen.getByRole('table', { name: 'Invoices' })).getAllByRole('rowgroup')[1]!,
  ).getAllByRole('row')

describe('DataTable regressions', () => {
  afterEach(() => vi.restoreAllMocks())

  it('keeps "select all matching" when a server-mode table moves to another page', async () => {
    const bulk = (selection: { count: number }) => (
      <button type="button">Archive {selection.count}</button>
    )
    const props = {
      mode: 'server' as const,
      rowCount: 312,
      selectable: true,
      bulkActions: bulk,
    }
    const { rerender } = render(table({ ...props, data: invoices.slice(0, 10) }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Select all 312' }))
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    // The parent loads page 2.
    rerender(table({ ...props, data: invoices.slice(10, 20) }))

    expect(screen.getByText('All 312 rows are selected.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Archive 312' })).toBeInTheDocument()
    for (const box of screen.getAllByRole('checkbox', { name: 'Select row' }))
      expect(box).toBeChecked()

    // Unchecking a row on the new page still ends "all matching".
    await userEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!)
    expect(screen.queryByText('All 312 rows are selected.')).not.toBeInTheDocument()
  })

  it('moves back to the last page when a server-mode total shrinks below the current page', () => {
    const onPaginationChange = vi.fn()
    const props = {
      mode: 'server' as const,
      defaultState: { pagination: { pageIndex: 3, pageSize: 10 } },
      onPaginationChange,
    }
    const { rerender } = render(table({ ...props, data: invoices.slice(30, 35), rowCount: 35 }))
    // The parent deleted every row on page 4.
    rerender(table({ ...props, data: [], rowCount: 30 }))
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 2, pageSize: 10 })
  })

  it('ignores sorting and filters for columns that no longer exist, without errors', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      table({
        defaultState: {
          sorting: [{ id: 'removed', desc: true }],
          columnFilters: [{ id: 'gone', value: 'x' }],
        },
      }),
    )
    expect(bodyRows()).toHaveLength(10)
    expect(error.mock.calls.filter(([message]) => /does not exist/.test(String(message)))).toEqual(
      [],
    )
  })

  it('reports no state changes just for mounting, even under StrictMode', () => {
    const onStateChange = vi.fn()
    render(
      <StrictMode>
        {table({
          mode: 'server',
          data: invoices.slice(0, 10),
          rowCount: 40,
          selectable: true,
          search: true,
          defaultState: { pagination: { pageIndex: 1, pageSize: 10 } },
          onStateChange,
        })}
      </StrictMode>,
    )
    expect(onStateChange).not.toHaveBeenCalled()
  })
})
