import { Button, Popover, PopoverContent, PopoverTrigger, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">What’s new?</Button>
      </PopoverTrigger>
      <PopoverContent showArrow side="top">
        <Text size="small">Glyph 0.2 adds overlays, toasts and a confirm hook.</Text>
      </PopoverContent>
    </Popover>
  )
}
