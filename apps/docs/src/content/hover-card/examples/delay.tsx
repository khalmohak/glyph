import { HoverCard, HoverCardContent, HoverCardTrigger, Text } from '@glyphui/ui'
import { GitPullRequest } from 'lucide-react'

export default function Example() {
  return (
    <Text>
      Fixed in{' '}
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger
          href="#pr-482"
          className="font-mono text-primary underline-offset-4 hover:underline"
        >
          #482
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-80">
          <div className="flex gap-3">
            <GitPullRequest className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            <div className="grid gap-1">
              <span className="text-small font-medium">
                Keep badges at content width in flex columns
              </span>
              <span className="text-caption text-muted-foreground">
                khalmohak merged 3 commits into main
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      .
    </Text>
  )
}
