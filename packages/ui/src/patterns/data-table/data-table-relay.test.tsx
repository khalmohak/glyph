import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GlyphProvider } from '../../provider/glyph-provider'
import { dataTableStyles } from './data-table.styles'
import { createColumnHelper, DataTable, parseTableSearch, tableSearch } from './index'

// Regressions found by the Relay sample app.

interface Ticket {
  id: string
  status: 'open' | 'pending' | 'closed'
}
const col = createColumnHelper<Ticket>()
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Waiting on customer' },
  { value: 'closed', label: 'Closed' },
]
const columns = [
  col.accessor('id', { header: 'Ticket' }),
  col.accessor('status', {
    header: 'Status',
    meta: { filter: { type: 'multi', options: statusOptions } },
  }),
]
const wrap = (children: ReactNode) => (
  <GlyphProvider storageKey={null} motion="none">
    {children}
  </GlyphProvider>
)

describe('phone cards (U2, U3)', () => {
  const original = window.matchMedia
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia
  })
  afterEach(() => {
    window.matchMedia = original
  })

  it('names the card list after the table', () => {
    render(
      wrap(
        <DataTable
          aria-label="Tickets"
          data={[{ id: 'T-1', status: 'open' }]}
          columns={columns}
          mobile="cards"
        />,
      ),
    )
    expect(screen.getByRole('list', { name: 'Tickets' })).toBeInTheDocument()
  })

  it('rounds cards like containers, not like controls', () => {
    // `rounded-md` is the control radius: a full pill in themes like playful.
    const card = dataTableStyles().card()
    expect(card).toContain('rounded-lg')
    expect(card).not.toContain('rounded-md')
  })
})

describe('table URLs (U4)', () => {
  it('builds a query string for a table view', () => {
    expect(
      tableSearch({
        search: 'printer',
        sorting: [{ id: 'updated', desc: true }],
        pagination: { pageIndex: 1, pageSize: 10 },
        columnFilters: [{ id: 'status', value: ['open', 'pending'] }],
      }),
    ).toBe('?page=2&sort=updated.desc&q=printer&f.status=open&f.status=pending')
    expect(tableSearch({ search: 'x' }, { prefix: 't' })).toBe('?t.q=x')
  })

  it('reads comma-joined values of a multi filter as separate values', () => {
    expect(parseTableSearch('?f.status=open,pending', { columns }).columnFilters).toEqual([
      { id: 'status', value: ['open', 'pending'] },
    ])
  })
})
