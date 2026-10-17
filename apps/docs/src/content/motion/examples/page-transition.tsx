import { PageTransition, SegmentedControl, Text } from '@glyphui/ui'
import { useState } from 'react'

const pages = {
  inbox: 'Three unread conversations, one waiting on you.',
  issues: '12 open issues, 3 due this week.',
  reports: 'Revenue is up 11.9% month over month.',
} as const
type Page = keyof typeof pages

export default function Example() {
  const [page, setPage] = useState<Page>('inbox')
  return (
    <div className="grid w-full max-w-md gap-4">
      <SegmentedControl<Page>
        aria-label="Page"
        value={page}
        onValueChange={setPage}
        options={[
          { value: 'inbox', label: 'Inbox' },
          { value: 'issues', label: 'Issues' },
          { value: 'reports', label: 'Reports' },
        ]}
      />
      {/* With a router: transitionKey={useLocation().pathname} around <Outlet />. */}
      <PageTransition
        transitionKey={page}
        className="grid gap-1 rounded-lg border border-border p-5"
      >
        <p className="font-display text-h4 capitalize">{page}</p>
        <Text tone="muted">{pages[page]}</Text>
      </PageTransition>
    </div>
  )
}
