import { Field, NumberInput } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Field label="Monthly budget">
        <NumberInput
          defaultValue={2500}
          min={0}
          step={50}
          locale="en-US"
          formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        />
      </Field>
      <Field label="Discount">
        <NumberInput defaultValue={15} min={0} max={100} step={5} suffix="%" />
      </Field>
    </div>
  )
}
