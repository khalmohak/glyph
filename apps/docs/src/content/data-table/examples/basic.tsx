import { Badge } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'

interface Invoice {
  id: string
  customer: string
  status: 'paid' | 'open' | 'overdue'
  total: number
}

const invoices: Invoice[] = [
  { id: 'INV-1042', customer: 'Northwind', status: 'paid', total: 1240 },
  { id: 'INV-1043', customer: 'Globex', status: 'open', total: 86.5 },
  { id: 'INV-1044', customer: 'Initech', status: 'overdue', total: 12900.75 },
  { id: 'INV-1045', customer: 'Umbrella', status: 'paid', total: 410 },
  { id: 'INV-1046', customer: 'Hooli', status: 'open', total: 2380 },
]

const tone = { paid: 'success', open: 'info', overdue: 'danger' } as const
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', {
    header: 'Invoice',
    cell: (info) => <span className="font-mono text-caption">{info.getValue()}</span>,
  }),
  col.accessor('customer', { header: 'Customer' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge tone={tone[info.getValue()]} dot>
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: { align: 'right' },
  }),
]

export default function Example() {
  return (
    <DataTable
      aria-label="Invoices"
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      search={{ placeholder: 'Search invoices…' }}
      selectable
      pageSize={4}
    />
  )
}
