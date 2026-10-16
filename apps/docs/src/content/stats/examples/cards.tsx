import { Stats } from '@glyphui/blocks'

export default function Example() {
  return (
    <Stats
      variant="cards"
      align="center"
      items={[
        { label: 'Teams', value: '4,200' },
        { label: 'Hours saved per month', value: '38k' },
        { label: 'Customer rating', value: '4.9/5' },
      ]}
    />
  )
}
