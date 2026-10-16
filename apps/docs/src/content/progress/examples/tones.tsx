import { Progress } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-md gap-4">
      <Progress aria-label="Storage" value={32} size="sm" />
      <Progress aria-label="Seats" value={64} tone="success" />
      <Progress aria-label="API quota" value={86} tone="warning" size="lg" />
      <Progress aria-label="Disk" value={97} tone="danger" />
    </div>
  )
}
