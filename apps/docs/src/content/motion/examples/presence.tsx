import { Button, m, Presence, Text } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(true)
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Button variant="outline" className="justify-self-start" onClick={() => setOpen((o) => !o)}>
        {open ? 'Dismiss' : 'Show'} banner
      </Button>
      <Presence>
        {open && (
          <m.div
            key="banner"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="rounded-lg border border-border bg-surface p-4 shadow-sm"
          >
            <Text weight="medium">Your trial ends in 3 days</Text>
            <Text size="small" tone="muted">
              Pick a plan to keep your invoices sending.
            </Text>
          </m.div>
        )}
      </Presence>
    </div>
  )
}
