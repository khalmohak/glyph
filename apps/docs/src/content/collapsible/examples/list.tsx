import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@glyphui/ui'
import { useState } from 'react'

const releases = [
  '0.2.0 · 25 new components',
  '0.1.1 · Signed releases',
  '0.1.0 · First public release',
  '0.0.3 · Theme engine',
  '0.0.2 · Presets',
  '0.0.1 · Initial commit',
]

export default function Example() {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm">
      <ul className="grid divide-y divide-border rounded-lg border border-border text-small">
        {releases.slice(0, 3).map((r) => (
          <li key={r} className="px-4 py-2.5">
            {r}
          </li>
        ))}
      </ul>
      <CollapsibleContent>
        <ul className="mt-2 grid divide-y divide-border rounded-lg border border-border text-small text-muted-foreground">
          {releases.slice(3).map((r) => (
            <li key={r} className="px-4 py-2.5">
              {r}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <Button variant="link" size="sm" className="mt-2">
          {open ? 'Show fewer releases' : `Show ${releases.length - 3} older releases`}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  )
}
