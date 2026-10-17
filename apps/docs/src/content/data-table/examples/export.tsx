import { Button } from '@glyphui/ui'
import { createColumnHelper, DataTable, exportTableCsv } from '@glyphui/ui/data-table'
import { Download } from 'lucide-react'
import { type Invoice, invoices, usd } from '../data'

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', { header: 'Customer' }),
  col.accessor('email', { header: 'Billing email' }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    // Spreadsheets want plain numbers, not "$1,240.00".
    meta: { align: 'right', csv: (value) => value.toFixed(2) },
  }),
]

export default function Example() {
  return (
    <DataTable
      aria-label="Invoices"
      data={invoices}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={5}
      selectable
      // This page, selected rows, or every row that matches the search.
      exportCsv={{ fileName: 'invoices.csv' }}
      search
      toolbar={
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Download />}
          // Export without a table, e.g. after fetching everything from your API.
          onClick={() => exportTableCsv({ data: invoices, columns, fileName: 'all-invoices.csv' })}
        >
          All, without the table
        </Button>
      }
    />
  )
}
