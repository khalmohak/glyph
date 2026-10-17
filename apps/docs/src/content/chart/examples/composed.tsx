import { ComposedChart } from '@glyphui/ui/chart'

const data = [
  { month: 'May', revenue: 18200, target: 20000 },
  { month: 'Jun', revenue: 21400, target: 22000 },
  { month: 'Jul', revenue: 23100, target: 24000 },
  { month: 'Aug', revenue: 26800, target: 26000 },
  { month: 'Sep', revenue: 31200, target: 28000 },
  { month: 'Oct', revenue: 34900, target: 30000 },
]

const usd = (v: number) => `$${(v / 1000).toFixed(0)}k`

export default function Example() {
  return (
    <ComposedChart
      className="w-full"
      title="Revenue against plan"
      data={data}
      index="month"
      valueFormatter={usd}
      series={[
        { key: 'revenue', label: 'Revenue', type: 'bar' },
        { key: 'target', label: 'Plan', type: 'line', color: 'muted-foreground' },
      ]}
    />
  )
}
