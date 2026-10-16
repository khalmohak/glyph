import { type DateRange, DateRangePicker, Field } from '@glyphui/ui'
import { useState } from 'react'

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)
const startOfMonth = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)

export default function Example() {
  const [range, setRange] = useState<DateRange | undefined>({ from: daysAgo(6), to: new Date() })
  return (
    <Field label="Report period" className="w-80">
      <DateRangePicker
        value={range}
        onValueChange={setRange}
        maxDate={new Date()}
        presets={[
          { label: 'Today', range: () => ({ from: new Date(), to: new Date() }) },
          { label: 'Last 7 days', range: () => ({ from: daysAgo(6), to: new Date() }) },
          { label: 'Last 30 days', range: () => ({ from: daysAgo(29), to: new Date() }) },
          { label: 'Month to date', range: () => ({ from: startOfMonth(), to: new Date() }) },
        ]}
      />
    </Field>
  )
}
