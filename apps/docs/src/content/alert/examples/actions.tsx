import { Alert, Button } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Show alert again
      </Button>
    )
  }
  return (
    <Alert
      tone="info"
      title="A new version is available"
      action={
        <Button size="sm" variant="outline">
          Update
        </Button>
      }
      onDismiss={() => setOpen(false)}
    >
      Version 2.4 adds keyboard shortcuts.
    </Alert>
  )
}
