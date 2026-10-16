import { Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-1">
      <Text>Default foreground</Text>
      <Text tone="muted">Muted, for secondary text</Text>
      <Text tone="faint">Faint, for hints and placeholders</Text>
      <Text tone="primary" weight="medium">
        Primary
      </Text>
      <Text tone="success">Payment received</Text>
      <Text tone="danger">Card declined</Text>
    </div>
  )
}
