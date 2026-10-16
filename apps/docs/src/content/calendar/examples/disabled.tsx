import { Calendar } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
      className="rounded-lg border border-border"
    />
  )
}
