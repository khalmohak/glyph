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
  type PresetName,
  presets,
  useColorMode,
  useCommandMenuShortcut,
} from '@glyphui/ui'
import { BookOpen, LayoutGrid, Monitor, Moon, Palette, Rocket, Search, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { StatusBadge } from './components/status-badge'
import { docsByCategory } from './lib/catalog'
import { useThemeChoice } from './theme-choice'

/** ⌘K palette: jump to any component or page, switch theme or color mode. */
export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setTheme } = useThemeChoice()
  const { setMode } = useColorMode()
  useCommandMenuShortcut(setOpen)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Search />}
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        Search components
        <Kbd className="ml-2 max-sm:hidden">⌘K</Kbd>
      </Button>
      <CommandMenu open={open} onOpenChange={setOpen} label="Search the docs">
        <CommandInput placeholder="Search components and pages…" />
        <CommandList>
          <CommandEmpty>No matches. Try a component name like “dialog”.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem icon={<BookOpen />} onSelect={() => navigate('/')}>
              Introduction
            </CommandItem>
            <CommandItem icon={<Rocket />} onSelect={() => navigate('/getting-started')}>
              Getting started
            </CommandItem>
            <CommandItem icon={<LayoutGrid />} onSelect={() => navigate('/components')}>
              All components
            </CommandItem>
          </CommandGroup>
          {docsByCategory().map(({ category, items }) => (
            <CommandGroup key={category} heading={category}>
              {items.map((doc) => (
                <CommandItem
                  key={doc.slug}
                  value={`${doc.name} ${category}`}
                  keywords={[doc.description]}
                  onSelect={() => navigate(`/components/${doc.slug}`)}
                >
                  <span className="flex flex-1 items-center justify-between gap-2">
                    {doc.name}
                    {doc.status !== 'stable' && <StatusBadge status={doc.status} />}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            {(Object.keys(presets) as PresetName[]).map((name) => (
              <CommandItem
                key={name}
                icon={<Palette />}
                value={`theme ${name}`}
                onSelect={() => setTheme(name)}
              >
                Use {name[0]!.toUpperCase() + name.slice(1)} theme
              </CommandItem>
            ))}
            <CommandItem icon={<Moon />} value="mode dark" onSelect={() => setMode('dark')}>
              Dark mode
            </CommandItem>
            <CommandItem icon={<Sun />} value="mode light" onSelect={() => setMode('light')}>
              Light mode
            </CommandItem>
            <CommandItem icon={<Monitor />} value="mode system" onSelect={() => setMode('system')}>
              Match system
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandMenu>
    </>
  )
}
