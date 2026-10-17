import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  toast,
  useConfirm,
} from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { Copy, MoreHorizontal, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { type Invoice, invoices as seed, statusTone, usd } from '../data'

const col = createColumnHelper<Invoice>()

export default function Example() {
  const [rows, setRows] = useState(seed)
  const confirm = useConfirm()

  async function remove(ids: string[]) {
    const ok = await confirm({
      title: ids.length === 1 ? `Delete ${ids[0]}?` : `Delete ${ids.length} invoices?`,
      description: 'Customers keep any PDFs already sent.',
      tone: 'danger',
    })
    if (!ok) return false
    setRows((current) => current.filter((row) => !ids.includes(row.id)))
    toast.success(ids.length === 1 ? 'Invoice deleted' : `${ids.length} invoices deleted`)
    return true
  }

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
    col.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              icon={<MoreHorizontal />}
              aria-label={`Actions for ${row.original.id}`}
              size="sm"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              icon={<Send />}
              onSelect={() => toast.success(`Reminder sent to ${row.original.email}`)}
            >
              Send reminder
            </DropdownMenuItem>
            <DropdownMenuItem
              icon={<Copy />}
              onSelect={() => navigator.clipboard?.writeText(row.original.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              icon={<Trash2 />}
              tone="danger"
              onSelect={() => remove([row.original.id])}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      meta: { align: 'right', className: 'w-12' },
    }),
  ]

  return (
    <DataTable
      aria-label="Invoices"
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      pageSize={8}
      selectable
      exportCsv={{ fileName: 'invoices.csv' }}
      bulkActions={(selection) => (
        <>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Send />}
            onClick={() => toast.success(`Sent ${selection.count} reminders`)}
          >
            Remind
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 />}
            onClick={async () => {
              if (await remove(selection.ids)) selection.clear()
            }}
          >
            Delete
          </Button>
        </>
      )}
    />
  )
}
