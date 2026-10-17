import { Button, Card, CardHeader, CardTitle, PageHeader, StatCard, Timeline } from '@glyphui/ui'
import { AreaChart, DonutChart, Sparkline } from '@glyphui/ui/chart'
import { AlertTriangle, CheckCircle2, DollarSign, FileText, Send, Users } from 'lucide-react'
import { Link } from 'react-router'
import { customers, invoices, revenue, usd } from '../data'

export function DashboardPage() {
  const outstanding = invoices
    .filter((i) => i.status === 'open' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0)
  const byPlan = ['Starter', 'Growth', 'Enterprise'].map((plan) => ({
    plan,
    customers: customers.filter((c) => c.plan === plan).length,
  }))

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Ada"
        description="Here’s how billing looks this month."
        actions={
          <Button size="sm" leftIcon={<FileText />} asChild>
            <Link to="/app/invoices?new=1">New invoice</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="MRR"
          value={usd.format(34900)}
          delta="11.9%"
          trend="up"
          icon={<DollarSign />}
          chart={<Sparkline title="MRR, last 6 months" values={revenue.map((r) => r.recurring)} />}
        />
        <StatCard
          label="Outstanding"
          value={usd.format(outstanding)}
          icon={<FileText />}
          description="Open and overdue"
        />
        <StatCard
          label="Customers"
          value={String(customers.length)}
          delta="2"
          trend="up"
          icon={<Users />}
        />
        <StatCard
          label="Days to pay"
          value="9.4"
          delta="12%"
          trend="down"
          invertTrend
          icon={<CheckCircle2 />}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <AreaChart
          className="lg:col-span-2"
          title="Revenue"
          description="Recurring and one-off, last 6 months"
          data={revenue}
          index="month"
          stacked
          series={[
            { key: 'recurring', label: 'Recurring' },
            { key: 'oneOff', label: 'One-off', color: 'info' },
          ]}
          valueFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
        />
        <DonutChart
          title="Customers by plan"
          data={byPlan}
          category="plan"
          value="customers"
          size={180}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <Timeline
          aria-label="Recent activity"
          items={[
            {
              title: 'Hooli paid INV-1044',
              time: '12 min ago',
              icon: <CheckCircle2 />,
              tone: 'success',
              description: usd.format(12900.75),
            },
            {
              title: 'Sent 14 invoices for October usage',
              time: '2h ago',
              icon: <Send />,
              tone: 'primary',
            },
            {
              title: 'INV-1043 is 5 days overdue',
              time: 'Yesterday',
              icon: <AlertTriangle />,
              tone: 'warning',
              description: 'Second reminder scheduled for tomorrow.',
            },
          ]}
        />
      </Card>
    </>
  )
}
