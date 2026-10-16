import { paginationRange } from '@glyphui/ui'

export default function Example() {
  return (
    <pre className="font-mono text-small text-muted-foreground">
      {[1, 6, 20]
        .map((page) => `page ${page}: ${JSON.stringify(paginationRange(page, 20))}`)
        .join('\n')}
    </pre>
  )
}
