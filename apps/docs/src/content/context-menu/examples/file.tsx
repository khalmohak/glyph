import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@glyphui/ui'
import { Copy, Download, FileText, Pencil, Share2, Trash2 } from 'lucide-react'

export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex w-72 select-none items-center gap-3 rounded-lg border border-dashed border-border-strong p-4">
          <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
          <div className="grid">
            <span className="text-small font-medium">Q3 board update.pdf</span>
            <span className="text-caption text-muted-foreground">2.4 MB · Right-click me</span>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem icon={<Pencil />} shortcut="F2">
          Rename
        </ContextMenuItem>
        <ContextMenuItem icon={<Copy />} shortcut="⌘D">
          Duplicate
        </ContextMenuItem>
        <ContextMenuItem icon={<Download />}>Download</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger icon={<Share2 />}>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Slack</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem icon={<Trash2 />} tone="danger" shortcut="⌫">
          Move to trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
