import { Button, EmptyState, ErrorState, LoadingState } from '@glyphui/ui'
import { FolderPlus } from 'lucide-react'

export default function Example() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <EmptyState
        icon={<FolderPlus />}
        title="No projects yet"
        description="Create a project to start tracking work."
        action={<Button size="sm">New project</Button>}
      />
      <ErrorState error={new Error('Network request failed.')} onRetry={() => {}} />
      <LoadingState label="Loading projects…" />
    </div>
  )
}
