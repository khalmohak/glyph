import { Field, PasswordInput } from '@glyphui/ui'

export default function Example() {
  return (
    <Field label="Password" className="w-72">
      <PasswordInput placeholder="Your password" />
    </Field>
  )
}
