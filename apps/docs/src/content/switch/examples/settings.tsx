import { Field, Switch } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-sm gap-4">
      <Field
        orientation="horizontal"
        label="Product updates"
        description="A short email when we ship."
      >
        <Switch defaultChecked />
      </Field>
      <Field orientation="horizontal" label="Weekly digest" description="Every Monday at 9:00.">
        <Switch />
      </Field>
    </div>
  )
}
