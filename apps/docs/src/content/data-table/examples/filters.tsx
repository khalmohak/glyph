import { Badge } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { formatDay, type Invoice, invoices, statusOptions, statusTone, usd } from '../data'

const col = createColumnHelper<Invoice>()
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)

const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', {
    header: 'Customer',
    meta: { filter: { type: 'text', placeholder: 'Company name' } },
  }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge tone={statusTone[info.getValue()]} dot className="capitalize">
        {info.getValue()}
      </Badge>
    ),
    // Faceted counts appear beside each option, from the other active filters.
    meta: { filter: { type: 'multi', options: statusOptions } },
  }),
  col.accessor('plan', {
    header: 'Plan',
    meta: {
      filter: {
        type: 'select',
        options: [
          { value: 'Starter', label: 'Starter' },
          { value: 'Growth', label: 'Growth' },
          { value: 'Enterprise', label: 'Enterprise' },
        ],
      },
    },
  }),
  col.accessor('issued', {
    header: 'Issued',
    cell: (info) => formatDay(info.getValue()),
    meta: {
      filter: {
        type: 'date-range',
        presets: [
          { label: 'Last 7 days', range: () => ({ from: daysAgo(6), to: new Date() }) },
          { label: 'Last 30 days', range: () => ({ from: daysAgo(29), to: new Date() }) },
        ],
      },
    },
  }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: {
      align: 'right',
      filter: { type: 'range', min: 0, step: 100, format: (n) => usd.format(n) },
    },
  }),
]

export default function Example() {
  return (
    <DataTable
      aria-label="Invoices"
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={8}
      defaultState={{ columnFilters: [{ id: 'status', value: ['open', 'overdue'] }] }}
    />
  )
}
