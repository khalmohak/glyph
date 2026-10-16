import { Spinner, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Spinner label="Syncing invoices" />
      <Text size="small" tone="muted" aria-hidden="true">
        Syncing invoices…
      </Text>
    </div>
  )
}
