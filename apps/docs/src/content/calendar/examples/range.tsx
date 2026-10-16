import { Calendar, type DateRange } from '@glyphui/ui'
import { useState } from 'react'

const inDays = (n: number) => new Date(Date.now() + n * 86_400_000)

export default function Example() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: inDays(6),
  })
  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
      className="rounded-lg border border-border"
    />
  )
}
