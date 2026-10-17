import { Badge } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { virtualRows } from '@glyphui/ui/data-table/virtual'
import { formatDay, type Invoice, makeInvoices, statusTone, usd } from '../../data-table/data'

const rows = makeInvoices(10_000)
// Create the virtualizer once, outside the component.
const virtual = virtualRows({ height: 420 })

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', { header: 'Customer' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge tone={statusTone[info.getValue()]} dot className="capitalize">
        {info.getValue()}
      </Badge>
    ),
  }),
  col.accessor('issued', { header: 'Issued', cell: (info) => formatDay(info.getValue()) }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: { align: 'right' },
  }),
]

export default function Example() {
  return (
    <DataTable
      aria-label="10,000 invoices"
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={false}
      search={{ placeholder: 'Search 10,000 invoices…' }}
      selectable
      virtualize={virtual}
    />
  )
}
