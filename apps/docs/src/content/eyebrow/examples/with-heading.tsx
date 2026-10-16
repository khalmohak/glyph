import { Eyebrow, Heading, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-lg gap-2">
      <Eyebrow tone="primary">Changelog</Eyebrow>
      <Heading level={2}>Faster tables, calmer forms</Heading>
      <Text tone="muted">Everything we shipped in October.</Text>
    </div>
  )
}
