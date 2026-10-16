import { Button, EmptyState } from '@glyphui/ui'
import { Compass } from 'lucide-react'
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={<Compass />}
      title="This page doesn't exist"
      description="The link may be old, or the component may have been renamed."
      action={
        <Button variant="outline" size="sm" asChild>
          <Link to="/components">Browse components</Link>
        </Button>
      }
    />
  )
}
