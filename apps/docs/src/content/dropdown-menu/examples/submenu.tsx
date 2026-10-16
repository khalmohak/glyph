import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@glyphui/ui'
import { FolderInput, UserPlus } from 'lucide-react'

export default function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Issue options</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={<UserPlus />}>Assign to me</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<FolderInput />}>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Design</DropdownMenuItem>
            <DropdownMenuItem>Engineering</DropdownMenuItem>
            <DropdownMenuItem>Growth</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
