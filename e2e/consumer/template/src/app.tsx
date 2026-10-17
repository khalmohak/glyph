import { Faq, Hero, Pricing } from '@glyphui/blocks'
import {
  AppShell,
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  DatePicker,
  Input,
  Modal,
  ModalClose,
  PageHeader,
  Select,
  SelectItem,
  Sidebar,
  SidebarContent,
  SidebarItem,
  StatCard,
  toast,
  useConfirm,
} from '@glyphui/ui'
import { AreaChart, Sparkline } from '@glyphui/ui/chart'
import {
  createColumnHelper,
  DataTable,
  type DataTableState,
  editableCell,
  useTableUrlState,
} from '@glyphui/ui/data-table'
import { virtualRows } from '@glyphui/ui/data-table/virtual'
import { Form, FormError, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { useState } from 'react'
import { z } from 'zod'

interface Invoice {
  id: string
  customer: string
  status: 'paid' | 'open'
  total: number
}

const invoices: Invoice[] = [
  { id: 'INV-1', customer: 'Northwind', status: 'paid', total: 120 },
  { id: 'INV-2', customer: 'Globex', status: 'open', total: 80 },
]

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('id', { header: 'Invoice' }),
  col.accessor('customer', { header: 'Customer' }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => (
      <Badge tone={info.getValue() === 'paid' ? 'success' : 'info'}>{info.getValue()}</Badge>
    ),
  }),
  col.accessor('total', {
    header: 'Total',
    cell: editableCell<Invoice, number>({ type: 'number', validate: (v) => (v < 0 ? 'No' : null) }),
    meta: { align: 'right', filter: { type: 'range', format: (n) => `$${n}` } },
  }),
]

const virtual = virtualRows({ height: 320 })

/** DataTable v2 in server mode with URL state, as a consumer would write it. */
function ServerInvoices() {
  const url = useTableUrlState({ prefix: 'inv' })
  const [state, setState] = useState<Partial<DataTableState>>({})
  return (
    <DataTable
      aria-label="Server invoices"
      mode="server"
      data={invoices}
      rowCount={120}
      columns={columns}
      getRowId={(row) => row.id}
      state={{ ...url.state, ...state }}
      onStateChange={(next, changed) => {
        url.onStateChange(next, changed)
        if (changed === 'rowSelection') setState({ rowSelection: next.rowSelection })
      }}
      selectable
      bulkActions={(selection) => (
        <Button onClick={selection.clear}>Clear {selection.count}</Button>
      )}
      columnControls
      densityToggle
      exportCsv={{ fileName: 'invoices.csv' }}
      onCellEdit={async ({ value }) => {
        if (Number(value) > 1e6) throw new Error('Too large')
      }}
      mobile="cards"
    />
  )
}

const schema = z.object({
  email: z.email('Enter a valid email'),
  plan: z.enum(['free', 'pro']),
  start: z.date('Pick a date'),
})

function SignupForm() {
  const form = useForm({ schema, defaultValues: { email: '', plan: 'free' } })
  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        if (values.email.endsWith('@taken.dev')) return { errors: { email: 'Already registered' } }
        toast.success(`Welcome, ${values.email}`)
      }}
    >
      <FormError />
      <FormField control={form.control} name="email" label="Email">
        {(field) => <Input type="email" {...field} />}
      </FormField>
      <FormField control={form.control} name="plan" label="Plan">
        {(field) => (
          <Select<'free' | 'pro'> value={field.value} onValueChange={field.onChange}>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
          </Select>
        )}
      </FormField>
      <FormField control={form.control} name="start" label="Start date">
        {(field) => <DatePicker value={field.value} onValueChange={field.onChange} />}
      </FormField>
      <FormSubmit>Sign up</FormSubmit>
    </Form>
  )
}

export function App() {
  const confirm = useConfirm()
  const [open, setOpen] = useState(false)
  return (
    <AppShell
      sidebar={
        <Sidebar>
          <SidebarContent>
            <SidebarItem href="/" active>
              Home
            </SidebarItem>
          </SidebarContent>
        </Sidebar>
      }
    >
      <PageHeader
        title="Dashboard"
        actions={
          <Button
            onClick={async () => {
              if (await confirm({ title: 'Delete?', tone: 'danger' })) toast('Deleted')
            }}
          >
            Delete
          </Button>
        }
      />
      <StatCard label="MRR" value="$1,200" chart={<Sparkline title="MRR" values={[1, 2, 3]} />} />
      <AreaChart
        title="Revenue"
        data={[
          { m: 'Jan', v: 1 },
          { m: 'Feb', v: 2 },
        ]}
        index="m"
        series={[{ key: 'v', label: 'Revenue' }]}
      />
      <DataTable aria-label="Invoices" data={invoices} columns={columns} search selectable />
      <ServerInvoices />
      <DataTable
        aria-label="All invoices"
        data={invoices}
        columns={columns}
        pageSize={false}
        virtualize={virtual}
      />
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>
        <SignupForm />
      </Card>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Hello"
        trigger={<Button variant="outline">Open</Button>}
        footer={
          <ModalClose asChild>
            <Button>Close</Button>
          </ModalClose>
        }
      >
        Body
      </Modal>
      <Hero title="Ship faster" description="Blocks from npm." actions={<Button>Start</Button>} />
      <Pricing
        tiers={[{ name: 'Pro', price: 10, features: ['A'], cta: { label: 'Buy', href: '#' } }]}
      />
      <Faq items={[{ question: 'Q?', answer: 'A.' }]} />
    </AppShell>
  )
}
