import { Field, Slider } from '@glyphui/ui'

export default function Example() {
  return (
    <Field label="Volume" className="max-w-sm">
      <Slider defaultValue={60} showValue={(v) => `${v}%`} marks={[0, 50, 100]} />
    </Field>
  )
}
