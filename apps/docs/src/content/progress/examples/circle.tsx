import { ProgressCircle } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex items-center gap-6">
      <ProgressCircle aria-label="Profile complete" value={40} size="sm" />
      <ProgressCircle aria-label="Onboarding" value={68} showValue />
      <ProgressCircle aria-label="Storage used" value={92} tone="warning" size="lg" showValue />
    </div>
  )
}
