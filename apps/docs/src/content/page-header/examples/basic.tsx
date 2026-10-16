import { Button, PageHeader } from '@glyphui/ui'
import { ListFilter, Plus } from 'lucide-react'

export default function Example() {
  return (
    <PageHeader
      eyebrow="Engineering"
      title="Issues"
      description="Everything the team is working on this cycle."
      actions={
        <>
          <Button variant="outline" size="sm" leftIcon={<ListFilter />}>
            Filter
          </Button>
          <Button size="sm" leftIcon={<Plus />}>
            New issue
          </Button>
        </>
      }
    />
  )
}
