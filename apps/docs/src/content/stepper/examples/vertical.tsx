import { Stepper } from '@glyphui/ui'

export default function Example() {
  return (
    <Stepper
      orientation="vertical"
      current={2}
      aria-label="Order status"
      className="max-w-sm"
      steps={[
        { title: 'Order placed', description: 'Oct 14, 09:12' },
        { title: 'Payment confirmed', description: 'Oct 14, 09:13' },
        { title: 'Packed', description: 'Ships from Frankfurt' },
        { title: 'Shipped' },
        { title: 'Delivered' },
      ]}
    />
  )
}
