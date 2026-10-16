import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@glyphui/ui'
import { Copy, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react'

export default function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton icon={<MoreHorizontal />} aria-label="Project actions" variant="outline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<Pencil />} shortcut="⌘R">
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Copy />} shortcut="⌘D">
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Share2 />}>Share</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Trash2 />} tone="danger" shortcut="⌫">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
