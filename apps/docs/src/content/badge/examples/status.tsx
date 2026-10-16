import { Badge } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge dot>Backlog</Badge>
      <Badge tone="warning" dot>
        In progress
      </Badge>
      <Badge tone="info" dot>
        In review
      </Badge>
      <Badge tone="success" dot>
        Deployed
      </Badge>
    </div>
  )
}
