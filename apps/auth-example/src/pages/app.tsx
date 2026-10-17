import { useAuth, useCan } from '@glyphui/auth'
import { RequireAuth, RequireRole } from '@glyphui/auth/react-router'
import { OrganizationSwitcher, UserMenu } from '@glyphui/auth/ui'
import {
  AppShell,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from '@glyphui/ui'
import { CreditCard, Home, RefreshCw, Settings, Shield, TimerOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { auth } from '../auth'

export function AppLayout() {
  const navigate = useNavigate()
  const canSeeBilling = useCan('billing:manage')
  return (
    <AppShell
      mobileBrand={<span className="text-small font-semibold">Ledgerline</span>}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <OrganizationSwitcher onSwitch={(org) => toast.success(`Switched to ${org.name}`)} />
          </SidebarHeader>
          <SidebarContent>
            <SidebarSection>
              <SidebarItem href="/app" end icon={<Home />}>
                Dashboard
              </SidebarItem>
              <SidebarItem href="/app/admin" icon={<Shield />}>
                Admin
              </SidebarItem>
              <SidebarItem
                href="/app/billing"
                icon={<CreditCard />}
                badge={canSeeBilling ? undefined : 'Locked'}
              >
                Billing
              </SidebarItem>
            </SidebarSection>
          </SidebarContent>
          <SidebarFooter>
            <UserMenu
              side="top"
              align="start"
              className="w-full"
              items={[{ label: 'Settings', href: '/app', icon: <Settings /> }]}
              onSignOut={() => navigate('/sign-in')}
            />
          </SidebarFooter>
        </Sidebar>
      }
    >
      <div className="mx-auto grid w-full max-w-5xl gap-6 p-4 md:p-8">
        {/* The loader guards the first visit; this guards sign-outs while the page is open. */}
        <RequireAuth>
          <Outlet />
        </RequireAuth>
      </div>
    </AppShell>
  )
}

interface Invoice {
  id: string
  customer: string
  status: 'paid' | 'open' | 'overdue'
  total: number
}

const tone = { paid: 'success', open: 'info', overdue: 'danger' } as const
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function DashboardPage() {
  const { user, session } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const organization = session?.organizations?.find((o) => o.id === session.activeOrganizationId)

  const load = useCallback(async () => {
    setError(null)
    // auth.fetch adds the token, refreshes once on a 401, and opens the expired-session
    // dialog if that fails too.
    const response = await auth.fetch(`${import.meta.env.BASE_URL}api/invoices`)
    if (response.ok) setInvoices((await response.json()) as Invoice[])
    else
      setError(
        response.status === 401 ? 'Sign in again to load invoices.' : 'Could not load invoices.',
      )
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <PageHeader
        eyebrow={organization?.name}
        title={`Welcome back, ${(user as { name?: string } | null)?.name ?? 'there'}`}
        description="Everything here is behind sign-in."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<TimerOff />}
              onClick={async () => {
                await fetch(`${import.meta.env.BASE_URL}api/dev/expire-session`, { method: 'POST' })
                toast('Session revoked on the server. Refresh the invoices to see what happens.')
              }}
            >
              Simulate session expiry
            </Button>
            <Button size="sm" leftIcon={<RefreshCw />} onClick={load}>
              Refresh invoices
            </Button>
          </>
        }
      />
      <Card padding="none" className="overflow-hidden">
        {error ? (
          <ErrorState error={new Error(error)} onRetry={load} />
        ) : !invoices ? (
          <div className="grid gap-3 p-5">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
          </div>
        ) : (
          <Table aria-label="Invoices">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-caption">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell>
                    <Badge tone={tone[invoice.status]} dot className="capitalize">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {usd.format(invoice.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  )
}

export function AdminPage() {
  return (
    <RequireRole roles="admin">
      <PageHeader title="Admin" description="Only admins see this page." />
      <EmptyState
        icon={<Shield />}
        title="Admin tools"
        description="Members, audit log and SSO would live here."
      />
    </RequireRole>
  )
}

export function BillingPage() {
  return (
    <RequireRole permission="billing:manage">
      <PageHeader title="Billing" description="Needs the billing:manage permission." />
      <EmptyState icon={<CreditCard />} title="Plan: Growth" description="Next invoice on Nov 1." />
    </RequireRole>
  )
}
