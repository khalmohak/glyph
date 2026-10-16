import { Card, DescriptionItem, DescriptionList } from '@glyphui/ui'

export default function Example() {
  return (
    <Card className="max-w-xs">
      <DescriptionList>
        <DescriptionItem term="Order">#10482</DescriptionItem>
        <DescriptionItem term="Shipping to">221B Baker Street, London</DescriptionItem>
        <DescriptionItem term="Delivery">Tuesday, between 9:00 and 12:00</DescriptionItem>
      </DescriptionList>
    </Card>
  )
}
