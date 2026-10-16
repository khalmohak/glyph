import { Field, Select, SelectItem } from '@glyphui/ui'

export default function Example() {
  return (
    <Field label="Region" className="max-w-xs">
      <Select placeholder="Choose a region" defaultValue="eu">
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="eu">Europe (Frankfurt)</SelectItem>
        <SelectItem value="ap">Asia Pacific (Tokyo)</SelectItem>
      </Select>
    </Field>
  )
}
