import { Field, Input } from '@glyphui/ui'

export default function Example() {
  return (
    <Field
      label="Email"
      required
      description="We send receipts here."
      error="Enter an email address like name@company.com"
      className="max-w-sm"
    >
      <Input type="email" defaultValue="ada@" />
    </Field>
  )
}
