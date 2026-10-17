import { LineChart } from '@glyphui/ui/chart'

const data = [
  { day: 'Oct 1', p95: 182 },
  { day: 'Oct 2', p95: 176 },
  { day: 'Oct 3', p95: 210 },
  { day: 'Oct 4', p95: 334 },
  { day: 'Oct 5', p95: 298 },
  { day: 'Oct 6', p95: 191 },
  { day: 'Oct 7', p95: 168 },
  { day: 'Oct 8', p95: 172 },
]

export default function Example() {
  return (
    <LineChart
      className="w-full"
      title="API latency"
      description="p95 response time, milliseconds"
      data={data}
      index="day"
      dots
      valueFormatter={(v) => `${v} ms`}
      series={[{ key: 'p95', label: 'p95' }]}
      referenceLines={[{ y: 250, label: 'SLO 250 ms', color: 'danger' }]}
      referenceAreas={[{ x1: 'Oct 4', x2: 'Oct 5', label: 'Incident #4182' }]}
    />
  )
}
