import { Button, IconButton } from '@glyphui/ui'
import { Plus, Settings2 } from 'lucide-react'

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" leftIcon={<Plus />}>
        Small
      </Button>
      <Button size="md" leftIcon={<Plus />}>
        Medium
      </Button>
      <Button size="lg" leftIcon={<Plus />}>
        Large
      </Button>
      <IconButton icon={<Settings2 />} aria-label="Settings" variant="outline" />
    </div>
  )
}
