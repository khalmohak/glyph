import { Field, NumberInput } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [seats, setSeats] = useState<number | null>(5)
  return (
    <Field
      label="Seats"
      description={`${seats ?? 0} × $16 = $${(seats ?? 0) * 16} per month`}
      className="w-56"
    >
      <NumberInput value={seats} onValueChange={setSeats} min={1} max={250} />
    </Field>
  )
}
