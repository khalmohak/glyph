import { ScatterChart } from '@glyphui/ui/chart'

const accounts = [
  { name: 'Northwind', seats: 42, mrr: 1240, tickets: 3, segment: 'SMB' },
  { name: 'Initech', seats: 18, mrr: 420, tickets: 1, segment: 'SMB' },
  { name: 'Vandelay', seats: 35, mrr: 910, tickets: 6, segment: 'SMB' },
  { name: 'Umbrella', seats: 96, mrr: 2380, tickets: 4, segment: 'Mid-market' },
  { name: 'Contoso', seats: 140, mrr: 3900, tickets: 9, segment: 'Mid-market' },
  { name: 'Soylent', seats: 120, mrr: 2600, tickets: 2, segment: 'Mid-market' },
  { name: 'Globex', seats: 260, mrr: 8200, tickets: 12, segment: 'Enterprise' },
  { name: 'Hooli', seats: 340, mrr: 12900, tickets: 7, segment: 'Enterprise' },
  { name: 'Wayne', seats: 410, mrr: 11200, tickets: 15, segment: 'Enterprise' },
]

export default function Example() {
  return (
    <ScatterChart
      className="w-full"
      title="Accounts by size and revenue"
      description="Bubble size is open support tickets"
      data={accounts}
      x="seats"
      y="mrr"
      size="tickets"
      name="name"
      groupBy="segment"
      xAxis={{ label: 'Seats' }}
      yAxis={{ label: 'MRR', formatter: (v: number) => `$${(v / 1000).toFixed(0)}k` }}
    />
  )
}
