import { CopyButton, Field, Input } from '@glyphui/ui'

export default function Example() {
  const key = 'gk_live_51Hx9Q2eZvKYlo2C8a7P'
  return (
    <Field
      label="Publishable key"
      description="Safe to use in your frontend."
      className="w-full max-w-md"
    >
      <div className="flex gap-2">
        <Input readOnly value={key} className="font-mono" />
        <CopyButton value={key} aria-label="Copy publishable key" />
      </div>
    </Field>
  )
}
