import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [grid, setGrid] = useState(true)
  const [rulers, setRulers] = useState(false)
  const [zoom, setZoom] = useState('100')
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-40 w-80 items-center justify-center rounded-lg border border-dashed border-border-strong bg-subtle text-small text-muted-foreground">
          Canvas · zoom {zoom}% · right-click
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel inset>View</ContextMenuLabel>
        <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
          Show grid
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={rulers} onCheckedChange={setRulers}>
          Show rulers
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel inset>Zoom</ContextMenuLabel>
        <ContextMenuRadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenuRadioItem value="50">50%</ContextMenuRadioItem>
          <ContextMenuRadioItem value="100">100%</ContextMenuRadioItem>
          <ContextMenuRadioItem value="200">200%</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}
