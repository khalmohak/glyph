import releases from 'virtual:glyph-releases'
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
import {
  BookOpen,
  Braces,
  FileText,
  Hash,
  History,
  LayoutGrid,
  LayoutTemplate,
  Monitor,
  Moon,
  Palette,
  Search,
  Shapes,
  Sun,
  Tag,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { StatusBadge } from './components/status-badge'
import { docs, docsByCategory } from './lib/catalog'
import { guideIndex } from './lib/content'
import { guides } from './lib/site'
import { releaseAnchor } from './lib/slug'
import { useThemeChoice } from './theme-choice'

interface PropHit {
  prop: string
  type: string
  component: string
  slug: string
}

/** Props of every documented component, loaded the first time the palette opens. */
function usePropIndex(enabled: boolean) {
  const [index, setIndex] = useState<PropHit[] | null>(null)
  useEffect(() => {
    if (!enabled || index) return
    let cancelled = false
    void import('virtual:glyph-props').then(({ default: props }) => {
      if (cancelled) return
      const hits: PropHit[] = []
      for (const doc of docs) {
        if (!doc.propsOf) continue
        for (const p of props[doc.propsOf] ?? [])
          hits.push({ prop: p.name, type: p.type, component: doc.propsOf, slug: doc.slug })
      }
      setIndex(hits)
    })
    return () => {
      cancelled = true
    }
  }, [enabled, index])
  return index
}

const pages = [
  { label: 'Home', href: '/', icon: <BookOpen /> },
  { label: 'All components', href: '/components', icon: <LayoutGrid /> },
  { label: 'Blocks', href: '/blocks', icon: <Shapes /> },
  { label: 'Theme studio', href: '/themes', icon: <Palette /> },
  { label: 'Templates', href: '/templates', icon: <LayoutTemplate /> },
  { label: 'File browser template', href: '/templates/viewers', icon: <LayoutTemplate /> },
  { label: 'Changelog', href: '/changelog', icon: <History /> },
]

/** ⌘K palette: pages, guides, components, props, theme and color mode. */
export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { setTheme } = useThemeChoice()
  const { setMode } = useColorMode()
  useCommandMenuShortcut(setOpen)
  const propIndex = usePropIndex(open)

  // Props are only listed for a real query, and capped: there are thousands of them.
  const propHits = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!propIndex || q.length < 3 || q.includes(' ')) return []
    return propIndex.filter((hit) => hit.prop.toLowerCase().includes(q)).slice(0, 12)
  }, [propIndex, query])

  const go = (href: string) => {
    setQuery('')
    navigate(href)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Search />}
        // Icon-only on phones so the top bar fits every theme (brutalist controls are larger).
        className="text-muted-foreground max-sm:gap-0 max-sm:px-2"
        onClick={() => setOpen(true)}
      >
        <span className="max-sm:sr-only">Search</span>
        <Kbd className="ml-6 max-sm:hidden">⌘K</Kbd>
      </Button>
      <CommandMenu
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery('')
        }}
        label="Search the docs"
      >
        <CommandInput
          placeholder="Search components, guides and props…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            No matches. Try a component like “dialog” or a prop like “clearable”.
          </CommandEmpty>
          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.href}
                icon={page.icon}
                value={`page ${page.label}`}
                onSelect={() => go(page.href)}
              >
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Guides">
            {guides.map((guide) => (
              <CommandItem
                key={guide.slug}
                icon={<FileText />}
                value={`guide ${guide.title}`}
                keywords={[guide.description]}
                onSelect={() => go(`/docs/${guide.slug}`)}
              >
                {guide.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {query.trim().length >= 2 && (
            <CommandGroup heading="Guide sections">
              {guideIndex.flatMap((guide) =>
                guide.headings.map((heading) => (
                  <CommandItem
                    key={`${guide.slug}#${heading.id}`}
                    icon={<Hash />}
                    value={`section ${heading.text} ${guide.title}`}
                    onSelect={() => go(`/docs/${guide.slug}#${heading.id}`)}
                  >
                    <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                      <span className="truncate">{heading.text}</span>
                      <span className="truncate text-caption text-faint-foreground">
                        {guide.title}
                      </span>
                    </span>
                  </CommandItem>
                )),
              )}
            </CommandGroup>
          )}
          {propHits.length > 0 && (
            <CommandGroup heading="Props">
              {propHits.map((hit) => (
                <CommandItem
                  key={`${hit.component}.${hit.prop}`}
                  icon={<Braces />}
                  // Contains the query, so the palette's own filter keeps it.
                  value={`prop ${hit.prop} ${hit.component} ${query}`}
                  onSelect={() => go(`/components/${hit.slug}`)}
                >
                  <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                    <span className="truncate font-mono text-small">
                      {hit.component}.<span className="text-foreground">{hit.prop}</span>
                    </span>
                    <span className="truncate font-mono text-caption text-faint-foreground">
                      {hit.type}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {docsByCategory().map(({ category, items }) => (
            <CommandGroup key={category} heading={category}>
              {items.map((doc) => (
                <CommandItem
                  key={doc.slug}
                  value={`${doc.name} ${category}`}
                  keywords={[doc.description, ...(doc.exports ?? [])]}
                  onSelect={() => go(`/components/${doc.slug}`)}
                >
                  <span className="flex flex-1 items-center justify-between gap-2">
                    {doc.name}
                    {doc.status !== 'stable' && <StatusBadge status={doc.status} />}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Releases">
            {releases.map((version) => (
              <CommandItem
                key={version}
                icon={<Tag />}
                value={`release changelog ${version}`}
                onSelect={() => go(`/changelog#${releaseAnchor(version)}`)}
              >
                {version === 'Unreleased' ? 'Unreleased changes' : `Release ${version}`}
              </CommandItem>
            ))}
          </CommandGroup>
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
