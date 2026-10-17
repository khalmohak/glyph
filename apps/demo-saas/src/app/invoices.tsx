import {
  Badge,
  Button,
  DatePicker,
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
  SegmentedControl,
  Select,
  SelectItem,
  toast,
  useConfirm,
} from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { Copy, MoreHorizontal, Plus, Send, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { z } from 'zod'
import { customers, type Invoice, type InvoiceStatus, invoices as seed, usd } from '../data'

const tone = { draft: 'neutral', open: 'info', paid: 'success', overdue: 'danger' } as const
const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

type Filter = 'all' | InvoiceStatus

export function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>(seed)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Invoice[]>([])
  const [params, setParams] = useSearchParams()
  const confirm = useConfirm()

  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  const remove = useCallback(
    async (targets: Invoice[]) => {
      const ok = await confirm({
        title:
          targets.length === 1 ? `Delete ${targets[0]!.id}?` : `Delete ${targets.length} invoices?`,
        description: 'Deleted invoices can’t be recovered. Customers keep any PDFs already sent.',
        tone: 'danger',
        confirmLabel: 'Delete',
      })
      if (!ok) return
      const ids = new Set(targets.map((t) => t.id))
      setRows((current) => current.filter((r) => !ids.has(r.id)))
      toast.success(targets.length === 1 ? 'Invoice deleted' : `${targets.length} invoices deleted`)
    },
    [confirm],
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
        cell: (info) => (
          <Badge tone={tone[info.getValue()]} dot className="capitalize">
            {info.getValue()}
          </Badge>
        ),
      }),
      col.accessor('due', {
        header: 'Due',
        cell: (info) => date.format(info.getValue()),
        sortingFn: 'datetime',
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
                onSelect={() => remove([row.original])}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ]
  }, [remove])

  return (
    <>
      <PageHeader
        title="Invoices"
        description={`${rows.length} invoices · ${usd.format(rows.reduce((s, r) => s + r.total, 0))} billed`}
        actions={
          <NewInvoiceModal
            open={params.get('new') === '1'}
            onOpenChange={(open) => setParams(open ? { new: '1' } : {})}
            onCreate={(invoice) => setRows((current) => [invoice, ...current])}
          />
        }
      />
      <DataTable
        aria-label="Invoices"
        data={visible}
        columns={columns}
        getRowId={(row) => row.id}
        search={{ placeholder: 'Search invoices…' }}
        selectable
        onSelectionChange={setSelected}
        initialSorting={[{ id: 'due', desc: true }]}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            {selected.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 />}
                onClick={() => remove(selected)}
              >
                Delete {selected.length}
              </Button>
            )}
            <SegmentedControl<Filter>
              aria-label="Status"
              size="sm"
              value={filter}
              onValueChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'open', label: 'Open' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'paid', label: 'Paid' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
          </div>
        }
      />
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
  onCreate: (invoice: Invoice) => void
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
          await new Promise((resolve) => setTimeout(resolve, 600))
          if (values.amount > 50_000)
            return { errors: { amount: 'Invoices over $50,000 need approval.' } }
          const customer = customers.find((c) => c.name === values.customer)!
          onCreate({
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
