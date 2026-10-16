import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@glyphui/ui'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

export default function Example() {
  const [showDone, setShowDone] = useState(true)
  const [showEmpty, setShowEmpty] = useState(false)
  const [order, setOrder] = useState('updated')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" leftIcon={<SlidersHorizontal />}>
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel inset>Show</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={showDone} onCheckedChange={setShowDone}>
          Completed issues
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={showEmpty} onCheckedChange={setShowEmpty}>
          Empty groups
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>Order by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={order} onValueChange={setOrder}>
          <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="created">Created</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priority">Priority</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
