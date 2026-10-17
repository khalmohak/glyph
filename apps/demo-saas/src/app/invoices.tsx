import {
  Badge,
  Button,
  DatePicker,
  DescriptionItem,
  DescriptionList,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Input,
  Modal,
  ModalClose,
  NumberInput,
  PageHeader,
  Select,
  SelectItem,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  toast,
  useConfirm,
} from '@glyphui/ui'
import {
  createColumnHelper,
  DataTable,
  type TableSelection,
  useTableUrlState,
} from '@glyphui/ui/data-table'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { useRouterUrlAdapter } from '@glyphui/ui/react-router'
import { Copy, MoreHorizontal, Plus, Send, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { z } from 'zod'
import {
  createInvoice,
  deleteInvoices,
  exportInvoices,
  type InvoicePage,
  invoiceSummary,
  listInvoices,
} from '../api'
import { customers, type Invoice, usd } from '../data'

const tone = { draft: 'neutral', open: 'info', paid: 'success', overdue: 'danger' } as const
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const defaultSort = [{ id: 'due', desc: true }]
const statusLabels = { open: 'Open', overdue: 'Overdue', paid: 'Paid', draft: 'Draft' } as const

export function InvoicesPage() {
  // Page, sort, search and filters live in the URL, through the router, so ⌘K can link to
  // `?q=INV-1043` and the back button walks through views.
  const url = useTableUrlState({ adapter: useRouterUrlAdapter(), pageSize: 10 })
  const [params, setParams] = useSearchParams()
  const confirm = useConfirm()
  const [page, setPage] = useState<InvoicePage>()
  const [summary, setSummary] = useState<{ count: number; billed: number }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>()
  const [version, setVersion] = useState(0)
  const [detail, setDetail] = useState<Invoice | null>(null)

  const sorting = url.state.sorting?.length ? url.state.sorting : defaultSort
  const query = useMemo(
    () => ({
      pageIndex: url.state.pagination?.pageIndex ?? 0,
      pageSize: url.state.pagination?.pageSize ?? 10,
      sorting,
      search: url.state.search ?? '',
      filters: url.state.columnFilters ?? [],
    }),
    [url.state, sorting],
  )
  const queryKey = JSON.stringify(query)

  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch when the query or data version changes
  useEffect(() => {
    let current = true
    setLoading(true)
    listInvoices(query).then(
      (result) => {
        if (!current) return
        setPage(result)
        setError(undefined)
        setLoading(false)
      },
      (reason: unknown) => {
        if (!current) return
        setError(reason)
        setLoading(false)
      },
    )
    return () => {
      current = false
    }
  }, [queryKey, version])

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh the totals after changes
  useEffect(() => {
    invoiceSummary().then(setSummary)
  }, [version])

  const refresh = () => setVersion((v) => v + 1)

  const remove = useCallback(
    async (target: { ids: string[] } | { all: number }) => {
      const count = 'all' in target ? target.all : target.ids.length
      const ok = await confirm({
        title:
          count === 1 && 'ids' in target ? `Delete ${target.ids[0]}?` : `Delete ${count} invoices?`,
        description: 'Deleted invoices can’t be recovered. Customers keep any PDFs already sent.',
        tone: 'danger',
        confirmLabel: 'Delete',
      })
      if (!ok) return false
      const deleted = await deleteInvoices(
        'all' in target ? { query: { search: query.search, filters: query.filters } } : target,
      )
      toast.success(deleted === 1 ? 'Invoice deleted' : `${deleted} invoices deleted`)
      setVersion((v) => v + 1)
      return true
    },
    [confirm, query.search, query.filters],
  )

  const columns = useMemo(() => {
    const col = createColumnHelper<Invoice>()
    return [
      col.accessor('id', {
        header: 'Invoice',
        cell: (info) => <span className="font-mono text-caption">{info.getValue()}</span>,
      }),
      col.accessor('customer', { header: 'Customer' }),
      col.accessor('status', {
        header: 'Status',
        enableSorting: false,
        cell: (info) => (
          <Badge tone={tone[info.getValue()]} dot className="capitalize">
            {info.getValue()}
          </Badge>
        ),
        meta: {
          filter: {
            type: 'multi',
            options: (Object.keys(statusLabels) as (keyof typeof statusLabels)[]).map((value) => ({
              value,
              label: statusLabels[value],
              count: page?.statusCounts[value] ?? 0,
            })),
          },
        },
      }),
      col.accessor('due', {
        header: 'Due',
        cell: (info) => date.format(info.getValue()),
        meta: { csv: (value) => value.toISOString().slice(0, 10) },
      }),
      col.accessor('total', {
        header: 'Total',
        cell: (info) => usd.format(info.getValue()),
        meta: { align: 'right', csv: (value) => value.toFixed(2) },
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
                variant="ghost"
                size="sm"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                icon={<Send />}
                onSelect={() => toast.success(`Sent ${row.original.id} to ${row.original.email}`)}
              >
                Send reminder
              </DropdownMenuItem>
              <DropdownMenuItem
                icon={<Copy />}
                onSelect={() => navigator.clipboard.writeText(row.original.id)}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                icon={<Trash2 />}
                tone="danger"
                onSelect={() => remove({ ids: [row.original.id] })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        meta: { align: 'right' },
      }),
    ]
  }, [remove, page?.statusCounts])

  const bulkActions = (selection: TableSelection<Invoice>) => (
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
          const done = await remove(
            selection.allMatching ? { all: selection.count } : { ids: selection.ids },
          )
          if (done) selection.clear()
        }}
      >
        Delete {selection.count}
      </Button>
    </>
  )

  const setModalOpen = (open: boolean) =>
    setParams(
      (current) => {
        if (open) current.set('new', '1')
        else current.delete('new')
        return current
      },
      { replace: true },
    )

  return (
    <>
      <PageHeader
        title="Invoices"
        description={
          summary ? `${summary.count} invoices · ${usd.format(summary.billed)} billed` : '\u00a0'
        }
        actions={
          <NewInvoiceModal
            open={params.get('new') === '1'}
            onOpenChange={setModalOpen}
            onCreate={async (invoice) => {
              await createInvoice(invoice)
              refresh()
            }}
          />
        }
      />
      <DataTable
        aria-label="Invoices"
        mode="server"
        data={page?.rows}
        rowCount={page?.total}
        loading={loading}
        error={error}
        onRetry={refresh}
        columns={columns}
        getRowId={(row) => row.id}
        state={{ ...url.state, sorting }}
        onStateChange={url.onStateChange}
        search={{ placeholder: 'Search invoices…' }}
        selectable
        bulkActions={bulkActions}
        exportCsv={{
          fileName: 'invoices.csv',
          fetchAll: () => exportInvoices({ search: query.search, filters: query.filters }),
        }}
        onRowClick={setDetail}
        mobile="cards"
      />
      <Sheet open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent>
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.id}</SheetTitle>
                <SheetDescription>
                  {detail.customer} · {detail.email}
                </SheetDescription>
              </SheetHeader>
              <SheetBody>
                <DescriptionList>
                  <DescriptionItem term="Status">
                    <Badge tone={tone[detail.status]} dot className="capitalize">
                      {detail.status}
                    </Badge>
                  </DescriptionItem>
                  <DescriptionItem term="Total">{usd.format(detail.total)}</DescriptionItem>
                  <DescriptionItem term="Issued">{date.format(detail.issued)}</DescriptionItem>
                  <DescriptionItem term="Due">{date.format(detail.due)}</DescriptionItem>
                </DescriptionList>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

const schema = z.object({
  customer: z.string().min(1, 'Choose a customer'),
  amount: z.number('Enter an amount').positive('Must be more than zero'),
  due: z.date('Choose a due date'),
  memo: z.string().max(140, 'Keep it under 140 characters'),
})

function NewInvoiceModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (invoice: Invoice) => Promise<void>
}) {
  const form = useForm({
    schema,
    defaultValues: { customer: '', amount: undefined, due: undefined, memo: '' },
  })

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
      title="New invoice"
      description="The customer gets an email with a payment link."
      trigger={
        <Button size="sm" leftIcon={<Plus />}>
          New invoice
        </Button>
      }
      footer={
        <>
          <ModalClose asChild>
            <Button variant="outline">Cancel</Button>
          </ModalClose>
          <FormSubmit form={form}>Create invoice</FormSubmit>
        </>
      }
    >
      <Form
        form={form}
        className="grid gap-4"
        onSubmit={async (values) => {
          if (values.amount > 50_000)
            return { errors: { amount: 'Invoices over $50,000 need approval.' } }
          const customer = customers.find((c) => c.name === values.customer)!
          await onCreate({
            id: `INV-${2000 + Math.floor(Math.random() * 1000)}`,
            customer: customer.name,
            email: customer.email,
            status: 'draft',
            issued: new Date(),
            due: values.due,
            total: values.amount,
          })
          toast.success('Invoice created', {
            description: `${customer.name} · ${usd.format(values.amount)}`,
          })
          onOpenChange(false)
          form.reset()
        }}
      >
        <FormError />
        <FormField control={form.control} name="customer" label="Customer" required>
          {(field) => (
            <Select
              placeholder="Choose a customer"
              value={field.value}
              onValueChange={field.onChange}
            >
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </Select>
          )}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField control={form.control} name="amount" label="Amount" required>
            {(field) => (
              <NumberInput
                value={field.value ?? null}
                onValueChange={(v) => field.onChange(v ?? undefined)}
                min={0}
                locale="en-US"
                formatOptions={{ style: 'currency', currency: 'USD' }}
              />
            )}
          </FormField>
          <FormField control={form.control} name="due" label="Due date" required>
            {(field) => (
              <DatePicker value={field.value} onValueChange={field.onChange} minDate={new Date()} />
            )}
          </FormField>
        </div>
        <FormField
          control={form.control}
          name="memo"
          label="Memo"
          description="Shown on the invoice."
        >
          {(field) => <Input placeholder="October usage" {...field} />}
        </FormField>
      </Form>
    </Modal>
  )
}
