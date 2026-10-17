/** Sample data shared by the DataTable examples. */

export type Status = 'paid' | 'open' | 'overdue' | 'draft'

export interface Invoice {
  id: string
  customer: string
  email: string
  status: Status
  plan: 'Starter' | 'Growth' | 'Enterprise'
  total: number
  issued: string
}

const customers = [
  'Northwind',
  'Globex',
  'Initech',
  'Umbrella',
  'Hooli',
  'Vandelay',
  'Contoso',
  'Stark Industries',
  'Wayne Enterprises',
  'Acme',
  'Soylent',
  'Tyrell',
]
const statuses: Status[] = ['paid', 'paid', 'open', 'overdue', 'paid', 'draft', 'open']
const plans = ['Starter', 'Growth', 'Enterprise'] as const

/** A stable, deterministic list of invoices. */
export function makeInvoices(count: number): Invoice[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = customers[(i * 7) % customers.length]!
    const day = new Date(2026, 9, 14 - Math.floor(i * 1.7))
    return {
      id: `INV-${String(1040 + i).padStart(4, '0')}`,
      customer,
      email: `billing@${customer.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      status: statuses[i % statuses.length]!,
      plan: plans[(i * 5) % 3]!,
      total: Math.round((((i * 7919) % 14000) + 80) * 100) / 100,
      issued: day.toISOString().slice(0, 10),
    }
  })
}

export const invoices = makeInvoices(48)

export const statusTone = {
  paid: 'success',
  open: 'info',
  overdue: 'danger',
  draft: 'neutral',
} as const

export const statusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'open', label: 'Open' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'draft', label: 'Draft' },
]

export const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
export const formatDay = (day: string) => dateFormat.format(new Date(`${day}T00:00:00`))

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface InvoiceQuery {
  page: number
  pageSize: number
  sort?: { id: string; desc: boolean } | undefined
  search?: string
  statuses?: string[]
}

const all = makeInvoices(312)

/** A pretend API: filters, sorts and pages 312 invoices on the "server", with latency. */
export async function fetchInvoices(query: InvoiceQuery) {
  await wait(450)
  let rows = all
  if (query.search) {
    const q = query.search.toLowerCase()
    rows = rows.filter(
      (r) => r.id.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q),
    )
  }
  // Counts per status for the filter, before the status filter itself applies.
  const statusCounts: Record<string, number> = {}
  for (const row of rows) statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  if (query.statuses?.length) rows = rows.filter((r) => query.statuses?.includes(r.status))
  if (query.sort) {
    const { id, desc } = query.sort
    const key = id as keyof Invoice
    rows = [...rows].sort(
      (a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (desc ? -1 : 1),
    )
  }
  const start = query.page * query.pageSize
  return { rows: rows.slice(start, start + query.pageSize), total: rows.length, statusCounts }
}
