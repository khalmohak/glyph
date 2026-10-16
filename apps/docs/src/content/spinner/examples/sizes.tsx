import { Spinner } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" className="text-primary" />
    </div>
  )
}
