import { Badge, DescriptionItem, DescriptionList } from '@glyphui/ui'

export default function Example() {
  return (
    <DescriptionList layout="inline" dividers className="max-w-xl">
      <DescriptionItem term="Workspace">Acme Inc.</DescriptionItem>
      <DescriptionItem term="Plan">
        <Badge tone="primary">Pro</Badge>
      </DescriptionItem>
      <DescriptionItem term="Billing email">billing@acme.com</DescriptionItem>
      <DescriptionItem term="Next invoice">Nov 1, 2026 · $192.00</DescriptionItem>
    </DescriptionList>
  )
}
