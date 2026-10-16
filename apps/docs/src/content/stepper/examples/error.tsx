import { Stepper } from '@glyphui/ui'

export default function Example() {
  return (
    <Stepper
      className="max-w-xl"
      current={2}
      aria-label="Checkout"
      steps={[
        { title: 'Cart' },
        { title: 'Shipping' },
        { title: 'Payment', description: 'Card declined', status: 'error' },
        { title: 'Review' },
      ]}
    />
  )
}
