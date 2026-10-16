import { Badge, type BadgeProps } from '@glyphui/ui'
import type { Status } from '../lib/doc'

const tone: Record<Status, BadgeProps['tone']> = {
  stable: 'success',
  beta: 'warning',
  planned: 'neutral',
}
const label: Record<Status, string> = { stable: 'Stable', beta: 'Beta', planned: 'Planned' }

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <Badge tone={tone[status]} dot className={className}>
      {label[status]}
    </Badge>
  )
}
