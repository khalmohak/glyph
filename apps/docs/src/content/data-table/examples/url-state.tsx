import { Badge, Button } from '@glyphui/ui'
import { createColumnHelper, DataTable, useTableUrlState } from '@glyphui/ui/data-table'
import { type Invoice, invoices, statusOptions, statusTone, usd } from '../data'

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
    meta: { filter: { type: 'multi', options: statusOptions } },
  }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: { align: 'right' },
  }),
]

export default function Example() {
  // Page, sort, search, filters and hidden columns live in the URL as `orders.*` params.
  const url = useTableUrlState({ prefix: 'orders', pageSize: 5 })
  return (
    <DataTable
      aria-label="Orders"
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={5}
      search={{ placeholder: 'Search orders…' }}
      columnControls={{ hide: true }}
      toolbar={
        <Button variant="ghost" size="sm" onClick={url.reset}>
          Reset view
        </Button>
      }
      {...url}
    />
  )
}
