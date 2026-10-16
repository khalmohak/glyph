import { Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-xl gap-3">
      <Text size="lead">A lead paragraph introduces a page in one or two calm sentences.</Text>
      <Text>Body text is tuned for long reading, with comfortable line height.</Text>
      <Text size="small">Small text for helper copy, metadata and table cells.</Text>
      <Text size="caption" mono>
        CAPTION · $48,210.00 · 12.4%
      </Text>
    </div>
  )
}
