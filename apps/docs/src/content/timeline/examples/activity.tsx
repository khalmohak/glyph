import { Timeline } from '@glyphui/ui'
import { GitCommitHorizontal, GitPullRequest, MessageSquare, Rocket } from 'lucide-react'

export default function Example() {
  return (
    <Timeline
      aria-label="Recent activity"
      className="max-w-md"
      items={[
        {
          title: 'Deployed v2.4.0 to production',
          time: '12 min ago',
          dateTime: '2026-10-17T09:41',
          icon: <Rocket />,
          tone: 'success',
          description: 'All 214 checks passed.',
        },
        {
          title: 'Merged “Add Combobox multi-select”',
          time: '1h ago',
          icon: <GitPullRequest />,
          tone: 'primary',
        },
        {
          title: 'Grace Hopper commented on #142',
          time: '3h ago',
          icon: <MessageSquare />,
          description: '“Keyboard support looks right, ship it.”',
        },
        { title: 'Pushed 3 commits to main', time: 'Yesterday', icon: <GitCommitHorizontal /> },
      ]}
    />
  )
}
