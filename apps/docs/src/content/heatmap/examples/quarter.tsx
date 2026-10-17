import { Text } from '@glyphui/ui'
import { Heatmap } from '@glyphui/ui/chart'
import { useState } from 'react'

const data = Array.from({ length: 92 }, (_, i) => ({
  date: new Date(2026, 6, 1 + i),
  tickets: (i * 37) % 11,
}))

export default function Example() {
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <div className="grid w-full gap-2">
      <Heatmap
        title="Support tickets, Q3"
        data={data}
        date="date"
        value="tickets"
        unit="tickets"
        from={new Date(2026, 6, 1)}
        to={new Date(2026, 8, 30)}
        weekStart={1}
        color="chart-2"
        locale="en-US"
        onCellClick={(date, value) =>
          setPicked(`${date.toLocaleDateString('en-US', { dateStyle: 'medium' })}: ${value}`)
        }
      />
      <Text size="small" tone="muted">
        {picked ? `Opened ${picked}` : 'Click a day or press Enter on it.'}
      </Text>
    </div>
  )
}
