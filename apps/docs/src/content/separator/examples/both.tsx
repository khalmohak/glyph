import { Separator, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-sm gap-3">
      <Text weight="medium">Acme Inc.</Text>
      <Separator />
      <div className="flex h-5 items-center gap-3 text-small text-muted-foreground">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Changelog</span>
        <Separator orientation="vertical" />
        <span>Status</span>
      </div>
    </div>
  )
}
