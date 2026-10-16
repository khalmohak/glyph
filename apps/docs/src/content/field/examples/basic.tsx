import { Field, Input } from '@glyphui/ui'

export default function Example() {
  return (
    <Field
      label="Display name"
      description="Shown on your profile and in comments."
      className="max-w-sm"
    >
      <Input defaultValue="Ada Lovelace" />
    </Field>
  )
}
