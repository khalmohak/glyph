import { type ColumnFiltersState, getFilterList, type SortingState } from '@glyphui/ui/data-table'
import { type Invoice, type InvoiceStatus, invoices as seed } from './data'

/**
 * A pretend invoices API, in memory with network-like latency. The invoices page talks to
 * it the way it would talk to a real backend: one query per table state.
 */

let store: Invoice[] = [...seed]

const latency = () => new Promise((resolve) => setTimeout(resolve, 250 + Math.random() * 200))

export interface InvoiceQuery {
  pageIndex: number
  pageSize: number
  sorting: SortingState
  search: string
  filters: ColumnFiltersState
}

export interface InvoicePage {
  rows: Invoice[]
  total: number
  /** Matches per status for the current search, ignoring the status filter itself. */
  statusCounts: Record<InvoiceStatus, number>
}

function matching(
  { search, filters }: Pick<InvoiceQuery, 'search' | 'filters'>,
  withStatus = true,
) {
  const q = search.trim().toLowerCase()
  const wanted = getFilterList(filters, 'status')
  return store.filter(
    (invoice) =>
      (!q || invoice.id.toLowerCase().includes(q) || invoice.customer.toLowerCase().includes(q)) &&
      (!withStatus || wanted.length === 0 || wanted.includes(invoice.status)),
  )
}

function compare(a: Invoice, b: Invoice, id: string): number {
  const x = a[id as keyof Invoice]
  const y = b[id as keyof Invoice]
  if (x instanceof Date && y instanceof Date) return x.getTime() - y.getTime()
  if (typeof x === 'number' && typeof y === 'number') return x - y
  return String(x).localeCompare(String(y))
}

export async function listInvoices(query: InvoiceQuery): Promise<InvoicePage> {
  await latency()
  const counts = { draft: 0, open: 0, paid: 0, overdue: 0 }
  for (const invoice of matching(query, false)) counts[invoice.status] += 1
  const rows = [...matching(query)].sort((a, b) => {
    for (const { id, desc } of query.sorting) {
      const order = compare(a, b, id)
      if (order !== 0) return desc ? -order : order
    }
    return 0
  })
  const start = query.pageIndex * query.pageSize
  return {
    rows: rows.slice(start, start + query.pageSize),
    total: rows.length,
    statusCounts: counts,
  }
}

/** Every invoice matching the search and filters, for "Export all". */
export async function exportInvoices(query: Pick<InvoiceQuery, 'search' | 'filters'>) {
  await latency()
  return matching(query)
}

export async function invoiceSummary() {
  await latency()
  return { count: store.length, billed: store.reduce((sum, invoice) => sum + invoice.total, 0) }
}

export async function createInvoice(invoice: Invoice) {
  await latency()
  store = [invoice, ...store]
}

/** Deletes by id, or every invoice matching a query ("select all" across pages). */
export async function deleteInvoices(
  target: { ids: string[] } | { query: Pick<InvoiceQuery, 'search' | 'filters'> },
) {
  await latency()
  const ids = new Set('ids' in target ? target.ids : matching(target.query).map((i) => i.id))
  store = store.filter((invoice) => !ids.has(invoice.id))
  return ids.size
}
