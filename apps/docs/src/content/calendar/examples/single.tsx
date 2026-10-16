import { Calendar } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div className="grid justify-items-center gap-2">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-lg border border-border"
      />
      <p className="text-small text-muted-foreground">
        {date ? `Selected ${date.toDateString()}` : 'No date selected'}
      </p>
    </div>
  )
}
