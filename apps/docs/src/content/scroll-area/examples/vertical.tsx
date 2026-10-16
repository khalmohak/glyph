import { ScrollArea, Separator } from '@glyphui/ui'

const releases = Array.from({ length: 40 }, (_, i) => `v0.${40 - i}.0`)

export default function Example() {
  return (
    <ScrollArea className="h-64 w-56 rounded-md border border-border">
      <div className="p-4">
        <p className="mb-3 text-small font-medium">Releases</p>
        {releases.map((tag) => (
          <div key={tag}>
            <p className="py-1.5 font-mono text-small text-muted-foreground">{tag}</p>
            <Separator />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
