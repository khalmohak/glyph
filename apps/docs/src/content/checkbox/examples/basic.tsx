import { Checkbox, Field } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-3">
      <Field orientation="horizontal" label="Send a copy to my email">
        <Checkbox defaultChecked />
      </Field>
      <Field
        orientation="horizontal"
        label="Archived projects"
        description="Only admins can include these."
        disabled
      >
        <Checkbox />
      </Field>
    </div>
  )
}
