import { ScrollArea } from '@glyphui/ui'

const swatches = [
  'Glyph',
  'Brutalist',
  'Editorial',
  'Playful',
  'Acme',
  'Nord',
  'Sand',
  'Forest',
  'Ink',
]

export default function Example() {
  return (
    <ScrollArea
      orientation="horizontal"
      className="w-full max-w-lg rounded-md border border-border"
    >
      <div className="flex w-max gap-3 p-4">
        {swatches.map((name) => (
          <div
            key={name}
            className="flex h-24 w-36 shrink-0 items-end rounded-md bg-muted p-3 text-small font-medium"
          >
            {name}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
