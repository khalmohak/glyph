import { SegmentedControl } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="max-w-sm">
      <SegmentedControl
        aria-label="Billing period"
        fullWidth
        defaultValue="yearly"
        options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly · save 20%' },
        ]}
      />
    </div>
  )
}
