import { Separator, ToggleGroup, ToggleGroupItem } from '@glyphui/ui'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react'

export default function Example() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-1 shadow-xs">
      <ToggleGroup type="multiple" size="sm" defaultValue={['bold']} aria-label="Text style">
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <Underline />
        </ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-5" />
      <ToggleGroup type="single" size="sm" defaultValue="left" aria-label="Alignment">
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
