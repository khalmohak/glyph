import { Combobox, Field } from '@glyphui/ui'
import { useState } from 'react'

const timezones = [
  { value: 'utc', label: 'UTC', keywords: ['gmt'] },
  {
    value: 'america-new-york',
    label: 'New York',
    description: 'UTC−5',
    keywords: ['est', 'eastern'],
  },
  {
    value: 'america-los-angeles',
    label: 'Los Angeles',
    description: 'UTC−8',
    keywords: ['pst', 'pacific'],
  },
  { value: 'europe-berlin', label: 'Berlin', description: 'UTC+1', keywords: ['cet'] },
  { value: 'asia-kolkata', label: 'Kolkata', description: 'UTC+5:30', keywords: ['ist', 'india'] },
  { value: 'asia-tokyo', label: 'Tokyo', description: 'UTC+9', keywords: ['jst'] },
] as const

type Timezone = (typeof timezones)[number]['value']

export default function Example() {
  const [zone, setZone] = useState<Timezone | null>('europe-berlin')
  return (
    <Field label="Timezone" description="Try “ist” or “pacific”." className="max-w-xs">
      <Combobox
        options={timezones}
        value={zone}
        onValueChange={setZone}
        placeholder="Pick a timezone"
      />
    </Field>
  )
}
