import {
  Button,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  CommandSeparator,
  Kbd,
  useCommandMenuShortcut,
} from '@glyphui/ui'
import { CircleDot, FilePlus, Moon, Search, Settings2, Users } from 'lucide-react'
import { useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(false)
  const [last, setLast] = useState<string | null>(null)
  useCommandMenuShortcut(setOpen)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" leftIcon={<Search />} onClick={() => setOpen(true)}>
        Search
        <Kbd className="ml-1">⌘K</Kbd>
      </Button>
      {last && <span className="text-small text-muted-foreground">Ran: {last}</span>}

      <CommandMenu open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No commands match.</CommandEmpty>
          <CommandGroup heading="Issues">
            <CommandItem icon={<FilePlus />} shortcut="C" onSelect={() => setLast('New issue')}>
              New issue
            </CommandItem>
            <CommandItem icon={<CircleDot />} onSelect={() => setLast('My issues')}>
              My issues
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Workspace">
            <CommandItem icon={<Users />} onSelect={() => setLast('Invite people')}>
              Invite people
            </CommandItem>
            <CommandItem
              icon={<Moon />}
              shortcut={['⌘', 'J']}
              onSelect={() => setLast('Toggle dark mode')}
            >
              Toggle dark mode
            </CommandItem>
            <CommandItem
              icon={<Settings2 />}
              shortcut={['⌘', ',']}
              onSelect={() => setLast('Settings')}
            >
              Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandMenu>
    </div>
  )
}
