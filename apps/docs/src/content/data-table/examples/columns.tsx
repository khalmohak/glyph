import { Badge } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { formatDay, type Invoice, invoices, statusTone, usd } from '../data'

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', {
    header: 'Invoice',
    size: 150,
    cell: (info) => <span className="font-mono text-caption">{info.getValue()}</span>,
  }),
  col.accessor('customer', { header: 'Customer', size: 180 }),
  col.accessor('email', { header: 'Billing email', size: 240 }),
  col.accessor('plan', { header: 'Plan', size: 120 }),
  col.accessor('status', {
    header: 'Status',
    size: 120,
    cell: (info) => (
      <Badge tone={statusTone[info.getValue()]} dot className="capitalize">
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor('issued', {
    header: 'Issued',
    size: 120,
    cell: (info) => formatDay(info.getValue()),
  }),
  col.accessor('total', {
    header: 'Total',
    size: 130,
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
      pageSize={20}
      // Hide, resize, pin and reorder from each column's ⋯ menu; drag headers to reorder.
      columnControls
      densityToggle
      maxHeight={380}
      defaultState={{ columnPinning: { left: ['id'] }, density: 'compact' }}
    />
  )
}
