import { Button, Input, Popover, PopoverContent, PopoverTrigger, Text } from '@glyphui/ui'
import { Link2 } from 'lucide-react'

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" leftIcon={<Link2 />}>
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-80 gap-3">
        <div className="grid gap-1">
          <p className="font-medium">Share this view</p>
          <Text size="small" tone="muted">
            Anyone in the workspace with the link can see it.
          </Text>
        </div>
        <div className="flex gap-2">
          <Input readOnly defaultValue="glyph.app/acme/views/q3" aria-label="Link" />
          <Button size="md">Copy</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
