import { Heading, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-2">
      <Heading level={2} size="h4">
        Billing
      </Heading>
      <Text size="small" tone="muted">
        An h2 in the outline, sized like an h4 for a dense settings page.
      </Text>
    </div>
  )
}
