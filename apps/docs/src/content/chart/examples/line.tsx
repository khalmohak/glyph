import { LineChart } from '@glyphui/ui/chart'

const data = [
  { month: 'Jan', revenue: 18200, costs: 12100 },
  { month: 'Feb', revenue: 21400, costs: 12800 },
  { month: 'Mar', revenue: 20100, costs: 13400 },
  { month: 'Apr', revenue: 26800, costs: 14100 },
  { month: 'May', revenue: 31200, costs: 15000 },
  { month: 'Jun', revenue: 34900, costs: 15600 },
]

const usd = (v: number) => `$${(v / 1000).toFixed(0)}k`

export default function Example() {
  return (
    <LineChart
      className="w-full"
      title="Revenue and costs, first half"
      data={data}
      index="month"
      series={[
        { key: 'revenue', label: 'Revenue' },
        { key: 'costs', label: 'Costs', color: 'muted-foreground' },
      ]}
      valueFormatter={usd}
    />
  )
}
