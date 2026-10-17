import { AreaChart } from '@glyphui/ui/chart'

// Ninety days of signups with a weekly rhythm and steady growth.
const data = Array.from({ length: 90 }, (_, i) => {
  const date = new Date(2026, 6, 18 + i)
  const weekday = date.getDay()
  const weekend = weekday === 0 || weekday === 6 ? 0.55 : 1
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    signups: Math.round((120 + i * 1.6 + 18 * Math.sin(i / 3)) * weekend),
  }
})

export default function Example() {
  return (
    <AreaChart
      className="w-full"
      title="Daily signups"
      description="Last 90 days"
      data={data}
      index="date"
      height={260}
      series={[{ key: 'signups', label: 'Signups' }]}
      brush={{ startIndex: 60 }}
    />
  )
}
