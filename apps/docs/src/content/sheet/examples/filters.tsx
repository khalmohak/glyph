import {
  Button,
  Checkbox,
  Field,
  Select,
  SelectItem,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@glyphui/ui'
import { ListFilter } from 'lucide-react'

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" leftIcon={<ListFilter />}>
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent size="sm">
        <SheetHeader>
          <SheetTitle>Filter issues</SheetTitle>
          <SheetDescription>Showing 48 of 312 issues.</SheetDescription>
        </SheetHeader>
        <SheetBody className="grid content-start gap-5">
          <Field label="Assignee">
            <Select placeholder="Anyone">
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </Select>
          </Field>
          <Field orientation="horizontal" label="Include archived">
            <Checkbox />
          </Field>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Reset</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Apply filters</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
