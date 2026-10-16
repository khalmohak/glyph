import { Avatar, Badge, HoverCard, HoverCardContent, HoverCardTrigger, Text } from '@glyphui/ui'
import { CalendarDays } from 'lucide-react'

export default function Example() {
  return (
    <Text>
      Reviewed by{' '}
      <HoverCard>
        <HoverCardTrigger
          href="#ada"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          @ada
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar name="Ada Lovelace" size="lg" />
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Ada Lovelace</span>
                <Badge tone="primary">Admin</Badge>
              </div>
              <Text size="small" tone="muted">
                Engineering lead. Owns the analytics engine and the design system.
              </Text>
              <span className="flex items-center gap-1.5 text-caption text-faint-foreground">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                Joined March 2021
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{' '}
      2 hours ago.
    </Text>
  )
}
