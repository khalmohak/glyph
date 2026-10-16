import { Field, RadioGroup, RadioGroupItem } from '@glyphui/ui'

export default function Example() {
  return (
    <Field label="Notify me about">
      <RadioGroup defaultValue="mentions">
        <RadioGroupItem value="all" label="All activity" />
        <RadioGroupItem
          value="mentions"
          label="Mentions only"
          description="When someone @mentions you."
        />
        <RadioGroupItem value="none" label="Nothing" />
      </RadioGroup>
    </Field>
  )
}
