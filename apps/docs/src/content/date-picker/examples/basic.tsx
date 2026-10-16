import { DatePicker, Field } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [date, setDate] = useState<Date | undefined>()
  return (
    <Field label="Launch date" description="Weekdays from today onward." className="w-72">
      <DatePicker
        value={date}
        onValueChange={setDate}
        minDate={new Date()}
        disabledDates={{ dayOfWeek: [0, 6] }}
        clearable
      />
    </Field>
  )
}
