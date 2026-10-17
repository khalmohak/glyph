import { Badge, Button, toast } from '@glyphui/ui'
import { createColumnHelper, DataTable, type DataTableState } from '@glyphui/ui/data-table'
import { Archive } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchInvoices, formatDay, type Invoice, statusOptions, statusTone, usd } from '../data'

const col = createColumnHelper<Invoice>()

export default function Example() {
  const [query, setQuery] = useState<
    Pick<DataTableState, 'pagination' | 'sorting' | 'search' | 'columnFilters'>
  >({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'issued', desc: true }],
    search: '',
    columnFilters: [],
  })
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchInvoices>>>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let current = true
    setLoading(true)
    const statuses = query.columnFilters.find((f) => f.id === 'status')?.value as
      | string[]
      | undefined
    fetchInvoices({
      page: query.pagination.pageIndex,
      pageSize: query.pagination.pageSize,
      sort: query.sorting[0],
      search: query.search,
      ...(statuses && { statuses }),
    }).then((next) => {
      if (!current) return
      setResult(next)
      setLoading(false)
    })
    return () => {
      current = false
    }
  }, [query])

  const columns = [
    col.accessor('id', {
      header: 'Invoice',
      cell: (info) => <span className="font-mono text-caption">{info.getValue()}</span>,
    }),
    col.accessor('customer', { header: 'Customer' }),
    col.accessor('status', {
      header: 'Status',
      enableSorting: false,
      cell: (info) => (
        <Badge tone={statusTone[info.getValue()]} dot className="capitalize">
          {info.getValue()}
        </Badge>
      ),
      meta: {
        // The server sends counts, so the filter shows them without loading every row.
        filter: {
          type: 'multi',
          options: statusOptions.map((o) => ({ ...o, count: result?.statusCounts[o.value] ?? 0 })),
        },
      },
    }),
    col.accessor('issued', { header: 'Issued', cell: (info) => formatDay(info.getValue()) }),
    col.accessor('total', {
      header: 'Total',
      cell: (info) => usd.format(info.getValue()),
      meta: { align: 'right' },
    }),
  ]

  return (
    <DataTable
      aria-label="Invoices"
      mode="server"
      data={result?.rows}
      rowCount={result?.total}
      loading={loading}
      columns={columns}
      getRowId={(row) => row.id}
      state={query}
      onStateChange={(next) =>
        setQuery({
          pagination: next.pagination,
          sorting: next.sorting,
          search: next.search,
          columnFilters: next.columnFilters,
        })
      }
      search={{ placeholder: 'Search 312 invoices…' }}
      selectable
      bulkActions={(selection) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Archive />}
          onClick={() => {
            toast.success(`Archived ${selection.count} invoices`)
            selection.clear()
          }}
        >
          Archive
        </Button>
      )}
    />
  )
}
