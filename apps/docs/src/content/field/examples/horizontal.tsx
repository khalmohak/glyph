import { Checkbox, Field, Switch } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field
        orientation="horizontal"
        label="Email me about mentions"
        description="At most one email a day."
      >
        <Switch defaultChecked />
      </Field>
      <Field orientation="horizontal" label="I accept the terms of service">
        <Checkbox />
      </Field>
    </div>
  )
}
