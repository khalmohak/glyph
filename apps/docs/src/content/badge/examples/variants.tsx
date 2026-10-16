import { Badge } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <Badge tone="primary" variant="soft">
          Soft
        </Badge>
        <Badge tone="primary" variant="solid">
          Solid
        </Badge>
        <Badge tone="primary" variant="outline">
          Outline
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge tone="danger" variant="soft">
          Overdue
        </Badge>
        <Badge tone="danger" variant="solid">
          Overdue
        </Badge>
        <Badge tone="danger" variant="outline">
          Overdue
        </Badge>
      </div>
    </div>
  )
}
