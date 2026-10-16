import { Combobox, Field } from '@glyphui/ui'

const labels = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature' },
  { value: 'design', label: 'Design' },
  { value: 'docs', label: 'Documentation' },
  { value: 'performance', label: 'Performance' },
  { value: 'a11y', label: 'Accessibility', keywords: ['a11y'] },
]

export default function Example() {
  return (
    <Field label="Labels" className="max-w-xs">
      <Combobox
        multiple
        options={labels}
        defaultValue={['bug', 'design']}
        searchPlaceholder="Filter labels…"
      />
    </Field>
  )
}
