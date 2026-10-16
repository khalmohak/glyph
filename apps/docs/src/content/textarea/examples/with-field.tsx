import { Field, Textarea } from '@glyphui/ui'

export default function Example() {
  return (
    <Field label="Release notes" description="Markdown is supported." className="max-w-md">
      <Textarea placeholder="What changed in this release?" rows={4} />
    </Field>
  )
}
