import { Container } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-2">
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Container key={size} size={size}>
          <div className="rounded-md border border-dashed border-border-strong bg-muted px-3 py-2 font-mono text-caption text-muted-foreground">
            size="{size}"
          </div>
        </Container>
      ))}
    </div>
  )
}
