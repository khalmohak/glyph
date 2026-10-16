import { cn } from '@glyphui/ui'

export default function Example() {
  const merged = cn(
    'text-h1 text-muted-foreground px-2',
    'text-small text-foreground',
    false && 'hidden',
  )
  return (
    <div className="grid gap-2">
      <code className="font-mono text-caption text-muted-foreground">{merged}</code>
      <p className={merged}>Later classes win: small, foreground text.</p>
    </div>
  )
}
