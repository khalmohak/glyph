import {
  AppShell,
  Avatar,
  Badge,
  Button,
  Field,
  Input,
  Modal,
  ModalClose,
  NumberInput,
  PageHeader,
  Select,
  SelectItem,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  StatCard,
  Text,
  toast,
} from '@glyphui/ui'
import { AreaChart, Sparkline } from '@glyphui/ui/chart'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { BarChart3, FileText, Home, Inbox, Plus, Settings, Users, Wallet } from 'lucide-react'
import { useState } from 'react'

type Status = 'paid' | 'open' | 'overdue' | 'draft'

interface Invoice {
  id: string
  customer: string
  status: Status
  total: number
}

const invoices: Invoice[] = [
  { id: 'INV-2041', customer: 'Northwind', status: 'paid', total: 12400 },
  { id: 'INV-2042', customer: 'Globex', status: 'open', total: 3180 },
  { id: 'INV-2043', customer: 'Initech', status: 'overdue', total: 8920 },
  { id: 'INV-2044', customer: 'Umbrella', status: 'paid', total: 1450 },
  { id: 'INV-2045', customer: 'Hooli', status: 'open', total: 22800 },
  { id: 'INV-2046', customer: 'Vandelay', status: 'draft', total: 640 },
  { id: 'INV-2047', customer: 'Soylent', status: 'overdue', total: 5310 },
  { id: 'INV-2048', customer: 'Stark', status: 'paid', total: 18900 },
]

const revenue = [
  { month: 'May', recurring: 18.2, usage: 4.1 },
  { month: 'Jun', recurring: 21.4, usage: 4.8 },
  { month: 'Jul', recurring: 23.1, usage: 6.2 },
  { month: 'Aug', recurring: 26.8, usage: 5.9 },
  { month: 'Sep', recurring: 31.2, usage: 7.4 },
  { month: 'Oct', recurring: 34.9, usage: 8.1 },
]

const tone = { paid: 'success', open: 'info', overdue: 'danger', draft: 'neutral' } as const
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const col = createColumnHelper<Invoice>()
const columns = [
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
    meta: {
      filter: {
        type: 'multi',
        options: [
          { value: 'paid', label: 'Paid' },
          { value: 'open', label: 'Open' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'draft', label: 'Draft' },
        ],
      },
    },
  }),
  col.accessor('total', {
    header: 'Total',
    cell: (info) => usd.format(info.getValue()),
    meta: { align: 'right' },
  }),
]

/**
 * The home page's live product: a slice of a billing app built only from Glyph components.
 * Everything works: filters, sorting, the chart tooltip and the New invoice modal.
 * `themeName` lets the modal (which renders outside the mock) follow the mock's theme.
 */
export function ProductMock({ themeName }: { themeName: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <AppShell
        layout="embedded"
        mobileBrand={<Text weight="medium">Ledgerline</Text>}
        sidebar={<MockSidebar />}
      >
        <div className="grid min-w-0 gap-5 p-5 sm:p-6">
          <PageHeader
            eyebrow="Billing"
            title="Invoices"
            description="October · 8 invoices · $73,600 billed"
            actions={
              <Button size="sm" leftIcon={<Plus />} onClick={() => setOpen(true)}>
                New invoice
              </Button>
            }
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="MRR"
              value="$34,900"
              delta="11.9%"
              trend="up"
              chart={
                <Sparkline
                  title="MRR, last six months"
                  values={revenue.map((r) => r.recurring)}
                  variant="area"
                />
              }
            />
            <StatCard label="Outstanding" value="$40,210" description="3 open, 2 overdue" />
            <StatCard label="Days to pay" value="9.4" delta="12%" trend="down" invertTrend />
          </div>
          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <DataTable
              aria-label="Invoices"
              data={invoices}
              columns={columns}
              getRowId={(row) => row.id}
              search={{ placeholder: 'Search invoices…' }}
              pageSize={5}
              defaultState={{
                columnFilters: [{ id: 'status', value: ['open', 'overdue'] }],
              }}
            />
            <AreaChart
              title="Revenue"
              description="Recurring and usage, in $k"
              data={revenue}
              index="month"
              stacked
              height={260}
              series={[
                { key: 'recurring', label: 'Recurring' },
                { key: 'usage', label: 'Usage' },
              ]}
              valueFormatter={(v) => `$${v.toFixed(1)}k`}
            />
          </div>
        </div>
      </AppShell>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="New invoice"
        description="The customer gets an email with a payment link."
        data-glyph-theme={themeName}
        className="font-sans text-foreground"
        onSubmit={() => {
          setOpen(false)
          toast.success('Invoice created', { description: 'Globex · $1,250' })
        }}
        footer={
          <>
            <ModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ModalClose>
            <Button type="submit">Create invoice</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Customer">
            <Select defaultValue="globex">
              <SelectItem value="globex">Globex</SelectItem>
              <SelectItem value="hooli">Hooli</SelectItem>
              <SelectItem value="initech">Initech</SelectItem>
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <NumberInput
                defaultValue={1250}
                min={0}
                locale="en-US"
                formatOptions={{ style: 'currency', currency: 'USD' }}
              />
            </Field>
            <Field label="Memo">
              <Input defaultValue="October usage" />
            </Field>
          </div>
        </div>
      </Modal>
    </>
  )
}

function MockSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="flex items-center gap-2 text-small font-semibold">
          <span className="grid size-6 place-items-center rounded-sm bg-primary text-primary-foreground">
            <Wallet className="size-3.5" aria-hidden="true" />
          </span>
          Ledgerline
        </span>
      </SidebarHeader>
      <SidebarContent aria-label="Ledgerline">
        <SidebarSection>
          <SidebarItem icon={<Home />}>Dashboard</SidebarItem>
          <SidebarItem icon={<FileText />} active badge={8}>
            Invoices
          </SidebarItem>
          <SidebarItem icon={<Users />}>Customers</SidebarItem>
          <SidebarItem icon={<BarChart3 />}>Reports</SidebarItem>
        </SidebarSection>
        <SidebarSection label="Workspace">
          <SidebarItem icon={<Inbox />} badge={3}>
            Inbox
          </SidebarItem>
          <SidebarItem icon={<Settings />}>Settings</SidebarItem>
        </SidebarSection>
      </SidebarContent>
      <SidebarFooter>
        <Avatar name="Ada Lovelace" size="sm" />
        <span className="truncate text-small font-medium">Ada Lovelace</span>
      </SidebarFooter>
    </Sidebar>
  )
}
