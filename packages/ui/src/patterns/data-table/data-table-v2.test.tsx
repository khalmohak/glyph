import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu'
import { GlyphProvider } from '../../provider/glyph-provider'
import { moveInOrder } from './data-table'
import {
  createColumnHelper,
  DataTable,
  type DataTableProps,
  type DataTableState,
  editableCell,
} from './index'

interface Invoice {
  id: string
  customer: string
  status: 'paid' | 'open' | 'overdue'
  total: number
  issued: string
}

// Filter editors load on first use; load them up front so tests don't wait on the import.
// A cold import (calendar, date-fns) can take well over 10 s on a busy CI runner.
beforeAll(async () => {
  await import('./filters/filter-editors')
}, 60_000)

const statuses = ['paid', 'open', 'overdue'] as const
const invoices: Invoice[] = Array.from({ length: 25 }, (_, i) => ({
  id: `INV-${100 + i}`,
  customer: ['Northwind', 'Globex', 'Initech', 'Umbrella', 'Hooli'][i % 5]!,
  status: statuses[i % 3]!,
  total: (i + 1) * 100,
  issued: `2026-0${(i % 3) + 1}-1${i % 9}`,
}))

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', { header: 'Customer', meta: { filter: { type: 'text' } } }),
  col.accessor('status', {
    header: 'Status',
    meta: {
      filter: {
        type: 'multi',
        options: statuses.map((s) => ({ value: s, label: s[0]!.toUpperCase() + s.slice(1) })),
      },
    },
  }),
  col.accessor('total', {
    header: 'Total',
    meta: { align: 'right', filter: { type: 'range' } },
  }),
  col.accessor('issued', { header: 'Issued', meta: { filter: { type: 'date-range' } } }),
]

function wrap(children: ReactNode) {
  return (
    <GlyphProvider storageKey={null} motion="none">
      {children}
    </GlyphProvider>
  )
}

function renderTable(props: Partial<DataTableProps<Invoice>> = {}) {
  return render(
    wrap(
      <DataTable
        aria-label="Invoices"
        data={invoices}
        columns={columns}
        getRowId={(row) => row.id}
        {...props}
      />,
    ),
  )
}

const table = () => screen.getByRole('table', { name: 'Invoices' })
const bodyRows = () => within(within(table()).getAllByRole('rowgroup')[1]!).getAllByRole('row')
const firstCells = () => bodyRows().map((row) => within(row).getAllByRole('cell')[0]!.textContent)

describe('DataTable state', () => {
  it('reports every change with the full state, and per-slice callbacks', async () => {
    const onStateChange = vi.fn()
    const onSortingChange = vi.fn()
    renderTable({ onStateChange, onSortingChange })
    await userEvent.click(screen.getByRole('button', { name: /Total/ }))
    expect(onSortingChange).toHaveBeenLastCalledWith([{ id: 'total', desc: false }])
    const [state, changed] = onStateChange.mock.calls.find(([, key]) => key === 'sorting')!
    expect(changed).toBe('sorting')
    expect((state as DataTableState).pagination.pageSize).toBe(10)
  })

  it('follows controlled slices', () => {
    const { rerender } = renderTable({ state: { pagination: { pageIndex: 1, pageSize: 5 } } })
    expect(firstCells()[0]).toBe('INV-105')
    rerender(
      wrap(
        <DataTable
          aria-label="Invoices"
          data={invoices}
          columns={columns}
          getRowId={(row) => row.id}
          state={{ pagination: { pageIndex: 4, pageSize: 5 } }}
        />,
      ),
    )
    expect(firstCells()[0]).toBe('INV-120')
  })

  it('sorts by several columns with shift-click and shows their order', async () => {
    renderTable()
    await userEvent.click(screen.getByRole('button', { name: /Status/ }))
    const user = userEvent.setup()
    await user.keyboard('{Shift>}')
    await user.click(screen.getByRole('button', { name: /Total/ }))
    await user.keyboard('{/Shift}')
    const sortButton = (name: string) =>
      within(screen.getByRole('columnheader', { name: new RegExp(name) })).getAllByRole(
        'button',
      )[0]!
    expect(sortButton('Status')).toHaveTextContent('Status, sort priority 1')
    expect(sortButton('Total')).toHaveTextContent('Total, sort priority 2')
    expect(screen.getByRole('columnheader', { name: /Status/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    // overdue rows sort last (alphabetical), lowest total first among "open"
    expect(firstCells()[0]).toBe('INV-101')
  })

  it('pages with page numbers and shows the range', async () => {
    renderTable()
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(screen.getByText('21–25 of 25')).toBeInTheDocument()
    expect(bodyRows()).toHaveLength(5)
  })
})

describe('DataTable filters', () => {
  it('adds a filter chip from the Filter menu and filters with faceted counts', async () => {
    renderTable()
    await userEvent.click(screen.getByRole('button', { name: 'Filter' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Status' }))
    const option = await screen.findByRole('option', { name: /Paid/ })
    // 25 rows cycle paid, open, overdue: 9 paid
    expect(option).toHaveTextContent('9')
    await userEvent.click(option)
    expect(option).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(screen.getByRole('option', { name: /Overdue/ }))
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Edit Status filter' })).toHaveTextContent(
      'Paid, Overdue',
    )
    expect(screen.getByText('1–10 of 17')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remove Status filter' }))
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument()
  })

  it('filters by range and text, shows no-results, and clears', async () => {
    renderTable({
      defaultState: {
        columnFilters: [
          { id: 'total', value: { min: 2000 } },
          { id: 'customer', value: 'glob' },
        ],
      },
    })
    expect(firstCells()).toEqual(['INV-121'])
    expect(screen.getByRole('button', { name: 'Edit Total filter' })).toHaveTextContent('≥ 2,000')
    await userEvent.click(screen.getByRole('button', { name: 'Edit Customer filter' }))
    const input = await screen.findByRole('textbox', { name: /Customer contains/ })
    await userEvent.clear(input)
    await userEvent.type(input, 'zzz')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByText('No rows match these filters')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]!)
    expect(screen.getByText('1–10 of 25')).toBeInTheDocument()
  })

  it('filters dates by whole days', () => {
    renderTable({
      defaultState: {
        columnFilters: [{ id: 'issued', value: { from: '2026-02-01', to: '2026-02-28' } }],
      },
    })
    expect(screen.getByText('1–8 of 8')).toBeInTheDocument()
  })

  it('resets to page one when filters change', async () => {
    const onPaginationChange = vi.fn()
    renderTable({
      onPaginationChange,
      defaultState: { pagination: { pageIndex: 2, pageSize: 10 } },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Filter' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Status' }))
    await userEvent.click(await screen.findByRole('option', { name: /Open/ }))
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 0, pageSize: 10 })
  })
})

describe('DataTable server mode', () => {
  it('hands sorting, filters and paging to the parent and keeps rows while loading', async () => {
    const onStateChange = vi.fn()
    const page = invoices.slice(0, 10)
    const { rerender } = renderTable({
      mode: 'server',
      data: page,
      rowCount: 312,
      onStateChange,
      search: true,
    })
    expect(screen.getByText('1–10 of 312')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ pagination: { pageIndex: 1, pageSize: 10 } }),
      'pagination',
    )
    await userEvent.click(screen.getByRole('button', { name: /Total/ }))
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sorting: [{ id: 'total', desc: false }],
        pagination: { pageIndex: 0, pageSize: 10 },
      }),
      expect.any(String),
    )
    // Rows are not sorted locally in server mode.
    expect(firstCells()[0]).toBe('INV-100')

    rerender(
      wrap(
        <DataTable
          aria-label="Invoices"
          data={page}
          columns={columns}
          getRowId={(row) => row.id}
          mode="server"
          rowCount={312}
          loading
        />,
      ),
    )
    expect(table()).toHaveAttribute('aria-busy', 'true')
    expect(bodyRows()).toHaveLength(10)
  })

  it('selects all matching rows across pages', async () => {
    const bulk = vi.fn((selection: { count: number; allMatching: boolean }) => (
      <button type="button">Archive {selection.count}</button>
    ))
    renderTable({
      mode: 'server',
      data: invoices.slice(0, 10),
      rowCount: 312,
      selectable: true,
      bulkActions: bulk,
    })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))
    expect(screen.getByText('All 10 rows on this page are selected.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Select all 312' }))
    expect(screen.getByText('All 312 rows are selected.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Archive 312' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('toolbar', { name: 'Bulk actions' })).getByText(/All 312/),
    ).toBeInTheDocument()

    // Unchecking one row ends "all matching".
    await userEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!)
    expect(screen.getByRole('button', { name: 'Archive 9' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument()
  })

  it('pages by cursor when there is no total', async () => {
    const onPaginationChange = vi.fn()
    renderTable({
      mode: 'server',
      data: invoices.slice(0, 10),
      hasNextPage: true,
      onPaginationChange,
    })
    expect(screen.getByText('Page 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPaginationChange).toHaveBeenLastCalledWith({ pageIndex: 1, pageSize: 10 })
  })

  it('loads more rows instead of paging', async () => {
    const onLoadMore = vi.fn()
    renderTable({ data: invoices.slice(0, 5), onLoadMore, hasNextPage: true })
    expect(bodyRows()).toHaveLength(5)
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(onLoadMore).toHaveBeenCalled()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument()
  })
})

describe('DataTable selection', () => {
  it('selects every filtered row in client mode', async () => {
    renderTable({ selectable: true })
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }))
    await userEvent.click(screen.getByRole('button', { name: 'Select all 25' }))
    expect(screen.getByText(/25 selected/)).toBeInTheDocument()
  })

  it('keeps selections of rows that remain when data changes', async () => {
    const onSelectionChange = vi.fn()
    const { rerender } = renderTable({ selectable: true, onSelectionChange })
    const boxes = screen.getAllByRole('checkbox', { name: 'Select row' })
    await userEvent.click(boxes[0]!)
    await userEvent.click(boxes[1]!)
    rerender(
      wrap(
        <DataTable
          aria-label="Invoices"
          data={invoices.slice(1)}
          columns={columns}
          getRowId={(row) => row.id}
          selectable
          onSelectionChange={onSelectionChange}
        />,
      ),
    )
    await waitFor(() => expect(onSelectionChange).toHaveBeenLastCalledWith([invoices[1]]))
  })

  it('stays on a real page when rows go away', async () => {
    const { rerender } = renderTable()
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    rerender(
      wrap(
        <DataTable
          aria-label="Invoices"
          data={invoices.slice(0, 12)}
          columns={columns}
          getRowId={(r) => r.id}
        />,
      ),
    )
    await waitFor(() => expect(screen.getByText('11–12 of 12')).toBeInTheDocument())
  })
})

describe('DataTable rows', () => {
  it('runs onRowClick but not for clicks on controls inside the row', async () => {
    const onRowClick = vi.fn()
    renderTable({ onRowClick, selectable: true })
    await userEvent.click(within(bodyRows()[0]!).getByText('Northwind'))
    expect(onRowClick).toHaveBeenCalledWith(invoices[0], expect.anything())
    onRowClick.mockClear()
    await userEvent.click(within(bodyRows()[0]!).getByRole('checkbox'))
    expect(onRowClick).not.toHaveBeenCalled()
    bodyRows()[1]!.focus()
    await userEvent.keyboard('{Enter}')
    expect(onRowClick).toHaveBeenCalledWith(invoices[1], expect.anything())
  })

  it('ignores clicks that bubble from portaled content, like a row menu', async () => {
    const onRowClick = vi.fn()
    const p = createColumnHelper<Invoice>()
    renderTable({
      onRowClick,
      columns: [
        ...columns,
        p.display({
          id: 'actions',
          cell: () => (
            <DropdownMenu>
              <DropdownMenuTrigger>Row menu</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ],
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Row menu' })[0]!)
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Archive' }))
    expect(onRowClick).not.toHaveBeenCalled()
  })

  it('links rows through the router link and makes the row clickable', async () => {
    const Link = vi.fn(({ href, children, ...props }: { href: string; children?: ReactNode }) => (
      <a href={href} {...props} onClick={(e) => e.preventDefault()}>
        {children}
      </a>
    ))
    render(
      <GlyphProvider storageKey={null} motion="none" linkComponent={Link}>
        <DataTable
          aria-label="Invoices"
          data={invoices}
          columns={columns}
          getRowId={(r) => r.id}
          getRowHref={(row) => `/invoices/${row.id}`}
        />
      </GlyphProvider>,
    )
    const link = screen.getByRole('link', { name: 'INV-100' })
    expect(link).toHaveAttribute('href', '/invoices/INV-100')
    const click = vi.spyOn(link, 'click')
    await userEvent.click(within(bodyRows()[0]!).getByText('Northwind'))
    expect(click).toHaveBeenCalled()
  })

  it('expands rows to show details', async () => {
    renderTable({ renderSubRow: (row) => <p>Details for {row.id}</p> })
    const toggle = screen.getAllByRole('button', { name: 'Show details' })[0]!
    await userEvent.click(toggle)
    expect(screen.getByText('Details for INV-100')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide details' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Hide details' }))
    expect(screen.queryByText('Details for INV-100')).not.toBeInTheDocument()
  })

  it('uses the density from state', () => {
    renderTable({ defaultState: { density: 'compact' } })
    expect(screen.getByRole('table').closest('[data-slot="data-table"]')).toHaveAttribute(
      'data-density',
      'compact',
    )
    expect(within(bodyRows()[0]!).getAllByRole('cell')[0]).toHaveClass('py-1.5')
  })

  it('renders cards on small screens', () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
    try {
      render(
        wrap(
          <DataTable
            data={invoices.slice(0, 2)}
            columns={columns}
            mobile="cards"
            selectable
            renderSubRow={(row) => <p>More about {row.id}</p>}
          />,
        ),
      )
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      const cards = within(
        document.querySelector<HTMLElement>('[data-slot="data-table-cards"]')!,
      ).getAllByRole('listitem')
      expect(cards).toHaveLength(2)
      expect(within(cards[0]!).getByText('INV-100')).toBeInTheDocument()
      expect(within(cards[0]!).getByText('Customer')).toBeInTheDocument()
      expect(within(cards[0]!).getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument()
      fireEvent.click(within(cards[0]!).getByRole('button', { name: 'Show details' }))
      expect(screen.getByText('More about INV-100')).toBeInTheDocument()
    } finally {
      window.matchMedia = original
    }
  })
})

describe('DataTable columns', () => {
  it('re-measures pinned offsets when header cells resize (e.g. a web font swapping in)', () => {
    const observed: Element[] = []
    const Original = globalThis.ResizeObserver
    globalThis.ResizeObserver = class {
      observe(element: Element) {
        observed.push(element)
      }
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
    try {
      renderTable({ defaultState: { columnPinning: { left: ['total'], right: [] } } })
      const headers = screen.getAllByRole('columnheader')
      expect(headers.some((th) => observed.includes(th))).toBe(true)
    } finally {
      globalThis.ResizeObserver = Original
    }
  })

  it('hides, pins and moves columns from the column menu', async () => {
    const onStateChange = vi.fn()
    renderTable({ columnControls: true, onStateChange })
    await userEvent.click(screen.getByRole('button', { name: 'Customer column options' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Move left' }))
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Customer')

    await userEvent.click(screen.getByRole('button', { name: 'Total column options' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Pin to left' }))
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ columnPinning: { left: ['total'], right: [] } }),
      'columnPinning',
    )
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Total')
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('data-pinned', 'left')

    await userEvent.click(screen.getByRole('button', { name: 'Issued column options' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Hide column' }))
    expect(screen.queryByRole('columnheader', { name: /Issued/ })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'View' }))
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Issued' })
    await userEvent.click(item)
    // The menu stays open so several columns can be toggled.
    expect(item).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('columnheader', { name: /Issued/ })).toBeInTheDocument()
  })

  it('resizes with the keyboard', async () => {
    renderTable({ columnControls: { resize: true } })
    const handle = screen.getByRole('separator', { name: 'Resize Customer column' })
    const before = Number(handle.getAttribute('aria-valuenow'))
    handle.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(before + 32)
    await userEvent.keyboard('{Enter}')
    expect(Number(handle.getAttribute('aria-valuenow'))).toBe(before)
  })

  it('keeps built-in columns first when reordering', () => {
    const order = ['__select', 'a', 'b', 'c']
    expect(moveInOrder(order, 'c', 'a')).toEqual(['__select', 'c', 'a', 'b'])
    expect(moveInOrder(order, 'a', 'c')).toEqual(['__select', 'b', 'c', 'a'])
    expect(moveInOrder(order, 'a', '__select')).toEqual(['__select', 'a', 'b', 'c'])
    expect(moveInOrder(order, 'x', 'a')).toEqual(order)
  })

  it('switches density from the View menu', async () => {
    renderTable({ densityToggle: true })
    await userEvent.click(screen.getByRole('button', { name: 'View' }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: 'Comfortable' }))
    expect(screen.getByRole('table').closest('[data-slot="data-table"]')).toHaveAttribute(
      'data-density',
      'comfortable',
    )
  })
})

describe('DataTable export', () => {
  it('downloads the current page as CSV', async () => {
    const blobs: Blob[] = []
    Object.assign(URL, {
      createObjectURL: (blob: Blob) => {
        blobs.push(blob)
        return 'blob:x'
      },
      revokeObjectURL: () => {},
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderTable({ exportCsv: { fileName: 'invoices.csv', bom: false } })
    await userEvent.click(screen.getByRole('button', { name: 'Export' }))
    await userEvent.click(await screen.findByRole('menuitem', { name: 'This page (10)' }))
    expect(click).toHaveBeenCalled()
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(blobs[0]!)
    })
    expect(text.split('\r\n')[0]).toBe('Invoice,Customer,Status,Total,Issued')
    expect(text.split('\r\n')).toHaveLength(11)
    click.mockRestore()
  })
})

describe('editableCell', () => {
  interface Person {
    id: string
    name: string
    age: number
  }
  const people: Person[] = [
    { id: '1', name: 'Ada', age: 36 },
    { id: '2', name: 'Grace', age: 85 },
  ]
  const p = createColumnHelper<Person>()
  const editable = [
    p.accessor('name', {
      header: 'Name',
      cell: editableCell<Person, string>({ validate: (v) => (v.trim() ? null : 'Required') }),
    }),
    p.accessor('age', { header: 'Age', cell: editableCell<Person, number>({ type: 'number' }) }),
  ]

  function Editable({ onCellEdit }: { onCellEdit: DataTableProps<Person>['onCellEdit'] }) {
    const [rows] = useState(people)
    return wrap(
      <DataTable data={rows} columns={editable} getRowId={(r) => r.id} onCellEdit={onCellEdit} />,
    )
  }

  it('saves on Enter and shows the new value right away', async () => {
    let resolve: () => void = () => {}
    const onCellEdit = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    render(<Editable onCellEdit={onCellEdit} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit Name' })[0]!)
    const input = screen.getByRole('textbox', { name: 'Name' })
    await userEvent.clear(input)
    await userEvent.type(input, 'Ada Lovelace{Enter}')
    expect(onCellEdit).toHaveBeenCalledWith({
      row: people[0],
      rowId: '1',
      columnId: 'name',
      value: 'Ada Lovelace',
      previous: 'Ada',
    })
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    await act(async () => resolve())
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('rolls back when saving fails', async () => {
    const onCellEdit = vi.fn(() => Promise.reject(new Error('Age is locked')))
    render(<Editable onCellEdit={onCellEdit} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit Age' })[1]!)
    const input = screen.getByRole('spinbutton', { name: 'Age' })
    await userEvent.clear(input)
    await userEvent.type(input, '90{Enter}')
    expect(onCellEdit).toHaveBeenCalledWith(expect.objectContaining({ value: 90, previous: 85 }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Age is locked')
    expect(screen.getAllByRole('button', { name: 'Edit Age' })[1]).toHaveTextContent('85')
  })

  it('validates, and cancels with Escape', async () => {
    const onCellEdit = vi.fn()
    render(<Editable onCellEdit={onCellEdit} />)
    await userEvent.click(screen.getAllByRole('button', { name: 'Edit Name' })[0]!)
    const input = screen.getByRole('textbox', { name: 'Name' })
    await userEvent.clear(input)
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(onCellEdit).not.toHaveBeenCalled()
    expect(screen.getAllByRole('button', { name: 'Edit Name' })[0]).toHaveTextContent('Ada')
  })
})
