import { BarChart } from '@glyphui/ui/chart'

const data = [
  { day: 'Mon', opened: 42, closed: 38 },
  { day: 'Tue', opened: 51, closed: 47 },
  { day: 'Wed', opened: 39, closed: 44 },
  { day: 'Thu', opened: 58, closed: 50 },
  { day: 'Fri', opened: 33, closed: 41 },
]

export default function Example() {
  return (
    <BarChart
      className="w-full"
      title="Issues opened and closed"
      data={data}
      index="day"
      height={220}
      series={[
        { key: 'opened', label: 'Opened' },
        { key: 'closed', label: 'Closed', color: 'success' },
      ]}
    />
  )
}
