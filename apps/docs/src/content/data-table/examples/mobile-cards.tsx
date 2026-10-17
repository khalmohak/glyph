import { Badge } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { type Invoice, invoices, statusTone, usd } from '../data'

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('customer', { header: 'Customer' }),
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge tone={statusTone[info.getValue()]} dot className="capitalize">
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: { align: 'right' },
  }),
  // Kept out of the cards to save space.
  col.accessor('email', { header: 'Billing email', meta: { mobile: 'hidden' } }),
]

export default function Example() {
  // Narrow your window below 640px: each row becomes a card, the first column leads it.
  return (
    <DataTable
      aria-label="Invoices"
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={4}
      selectable
      mobile="cards"
    />
  )
}
