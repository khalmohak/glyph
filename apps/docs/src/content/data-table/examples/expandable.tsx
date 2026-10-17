import { Badge, DescriptionItem, DescriptionList } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { formatDay, type Invoice, invoices, statusTone, usd } from '../data'

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
      data={invoices.slice(0, 6)}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={false}
      // Drafts have nothing to show yet.
      getRowCanExpand={(row) => row.status !== 'draft'}
      renderSubRow={(row) => (
        <DescriptionList className="grid-cols-2 gap-x-10 px-14 py-4 sm:grid-cols-4">
          <DescriptionItem term="Billing email">{row.email}</DescriptionItem>
          <DescriptionItem term="Plan">{row.plan}</DescriptionItem>
          <DescriptionItem term="Issued">{formatDay(row.issued)}</DescriptionItem>
          <DescriptionItem term="Tax (20%)">{usd.format(row.total * 0.2)}</DescriptionItem>
        </DescriptionList>
      )}
    />
  )
}
