import { Timeline, TimelineItem } from '@glyphui/ui'
import { Check, Package, Truck } from 'lucide-react'

export default function Example() {
  return (
    <Timeline aria-label="Order #4821" className="max-w-sm">
      <TimelineItem title="Order placed" time="Oct 12, 09:14" icon={<Check />} tone="success">
        3 items · $148.00
      </TimelineItem>
      <TimelineItem title="Packed" time="Oct 12, 16:02" icon={<Package />} tone="success" />
      <TimelineItem title="Out for delivery" time="Today, 08:30" icon={<Truck />} tone="primary">
        Arrives between 2 pm and 4 pm.
      </TimelineItem>
      <TimelineItem title="Delivered" />
    </Timeline>
  )
}
