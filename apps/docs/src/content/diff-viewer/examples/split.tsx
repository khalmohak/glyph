import { DiffViewer } from '@glyphui/viewers/diff'

const before = `Refunds
Customers can ask for a refund within 14 days of payment.
Refunds go back to the original payment method.
Annual plans are refunded in full.`

const after = `Refunds
Customers can ask for a refund within 30 days of payment.
Refunds go back to the original payment method within 5 business days.
Annual plans are refunded for the unused months.`

export default function Example() {
  return (
    <DiffViewer
      oldValue={before}
      newValue={after}
      fileName="refund-policy.md"
      defaultView="split"
      wrap
      className="w-full"
    />
  )
}
