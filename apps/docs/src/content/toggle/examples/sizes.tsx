import { Toggle } from '@glyphui/ui'
import { Pin } from 'lucide-react'

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle size="sm" aria-label="Pin small">
        <Pin />
      </Toggle>
      <Toggle size="md" aria-label="Pin medium" defaultPressed>
        <Pin />
      </Toggle>
      <Toggle size="lg" aria-label="Pin large">
        <Pin />
      </Toggle>
      <Toggle variant="outline" size="sm">
        Small
      </Toggle>
      <Toggle variant="outline" defaultPressed>
        Medium
      </Toggle>
      <Toggle variant="outline" size="lg">
        Large
      </Toggle>
    </div>
  )
}
