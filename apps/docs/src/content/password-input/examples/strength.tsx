import { Field, PasswordInput } from '@glyphui/ui'

export default function Example() {
  return (
    <Field
      label="New password"
      description="At least 12 characters, mixing letters, numbers and symbols."
      className="w-80"
    >
      <PasswordInput autoComplete="new-password" showStrength />
    </Field>
  )
}
