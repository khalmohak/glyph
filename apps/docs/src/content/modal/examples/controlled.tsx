import { Button, Modal, Text } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        View keyboard shortcuts
      </Button>
      <Text size="small" tone="muted">
        Modal is {open ? 'open' : 'closed'}
      </Text>
      <Modal
        open={open}
        onOpenChange={setOpen}
        size="sm"
        title="Keyboard shortcuts"
        footer={<Button onClick={() => setOpen(false)}>Got it</Button>}
      >
        <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-small">
          <dt>Search</dt>
          <dd className="font-mono text-muted-foreground">⌘K</dd>
          <dt>New issue</dt>
          <dd className="font-mono text-muted-foreground">C</dd>
          <dt>Go to inbox</dt>
          <dd className="font-mono text-muted-foreground">G then I</dd>
        </dl>
      </Modal>
    </div>
  )
}
