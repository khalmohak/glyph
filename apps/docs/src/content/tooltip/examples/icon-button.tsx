import { IconButton, Tooltip } from '@glyphui/ui'
import { Bell, Settings2 } from 'lucide-react'

export default function Example() {
  return (
    <div className="flex gap-2">
      <Tooltip content="Notifications">
        <IconButton icon={<Bell />} aria-label="Notifications" variant="outline" />
      </Tooltip>
      <Tooltip content="Settings">
        <IconButton icon={<Settings2 />} aria-label="Settings" variant="outline" />
      </Tooltip>
    </div>
  )
}
