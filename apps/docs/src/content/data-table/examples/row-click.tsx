import {
  Badge,
  DescriptionItem,
  DescriptionList,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { useState } from 'react'
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
  const [open, setOpen] = useState<Invoice | null>(null)
  return (
    <>
      <DataTable
        aria-label="Invoices"
        data={invoices}
        columns={columns}
        getRowId={(row) => row.id}
        pageSize={5}
        selectable
        // Click a row (or focus it and press Enter). Checkboxes and buttons keep their own clicks.
        onRowClick={(row) => setOpen(row)}
      />
      <Sheet open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
        <SheetContent>
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>{open.id}</SheetTitle>
                <SheetDescription>{open.customer}</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <DescriptionList>
                  <DescriptionItem term="Status">{open.status}</DescriptionItem>
                  <DescriptionItem term="Total">{usd.format(open.total)}</DescriptionItem>
                  <DescriptionItem term="Issued">{formatDay(open.issued)}</DescriptionItem>
                  <DescriptionItem term="Billing email">{open.email}</DescriptionItem>
                </DescriptionList>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
