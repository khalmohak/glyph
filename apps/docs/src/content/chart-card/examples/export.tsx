import { Button } from '@glyphui/ui'
import { BarChart, exportChart } from '@glyphui/ui/chart'
import { Download } from 'lucide-react'
import { useRef } from 'react'

const data = [
  { quarter: 'Q1', bookings: 182000 },
  { quarter: 'Q2', bookings: 214000 },
  { quarter: 'Q3', bookings: 268000 },
  { quarter: 'Q4', bookings: 311000 },
]

export default function Example() {
  const chart = useRef<HTMLDivElement>(null)
  return (
    <div className="grid w-full gap-3">
      <div ref={chart}>
        <BarChart
          title="Bookings by quarter"
          data={data}
          index="quarter"
          height={200}
          valueFormatter={(v) => `$${Math.round(v / 1000)}k`}
          series={[{ key: 'bookings', label: 'Bookings' }]}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download />}
          onClick={() => exportChart(chart, { format: 'svg', fileName: 'bookings' })}
        >
          SVG
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download />}
          onClick={() => exportChart(chart, { format: 'png', fileName: 'bookings' })}
        >
          PNG
        </Button>
      </div>
    </div>
  )
}
