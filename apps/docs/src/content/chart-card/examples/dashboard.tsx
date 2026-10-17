import { ChartCard, LineChart } from '@glyphui/ui/chart'
import { useState } from 'react'

type Period = '7d' | '30d' | '90d'

const lengths: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 90 }

function series(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(2026, 9, 16 - days + 1 + i)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      active: Math.round(2400 + i * (900 / days) + 160 * Math.sin(i / 2)),
      new: Math.round(310 + 60 * Math.cos(i / 3)),
    }
  })
}

export default function Example() {
  const [period, setPeriod] = useState<Period>('30d')
  return (
    <ChartCard
      className="w-full"
      title="Active users"
      description="Daily, compared with new signups"
      period={{
        value: period,
        onValueChange: setPeriod,
        options: [
          { value: '7d', label: '7d' },
          { value: '30d', label: '30d' },
          { value: '90d', label: '90d' },
        ],
      }}
    >
      <LineChart
        title="Active users"
        data={series(lengths[period])}
        index="date"
        height={220}
        series={[
          { key: 'active', label: 'Active' },
          { key: 'new', label: 'New' },
        ]}
      />
    </ChartCard>
  )
}
