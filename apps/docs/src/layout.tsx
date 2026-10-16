import {
  AppShell,
  Badge,
  Button,
  type ColorModePreference,
  IconButton,
  type PresetName,
  presets,
  Select,
  SelectItem,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarTrigger,
  Tooltip,
  useColorMode,
} from '@glyphui/ui'
import { BookOpen, Github, LayoutGrid, Monitor, Moon, Rocket, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { docsByCategory } from './lib/catalog'
import { SearchCommand } from './search'
import { useThemeChoice } from './theme-choice'

const REPO = 'https://github.com/khalmohak/glyph'

export function Layout() {
  const { pathname } = useLocation()
  // Scroll to top on navigation; the AppShell main area is the page scroller.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run on every route change
  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <AppShell sidebar={<DocsSidebar pathname={pathname} />} mobileBrand={<Brand />}>
      <TopBar />
      <main className="mx-auto w-full max-w-5xl min-w-0 px-4 pt-8 pb-24 sm:px-8">
        <Outlet />
      </main>
    </AppShell>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 rounded-sm text-foreground">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
        <path d="M12 2 22 12 12 22 2 12Z" fill="currentColor" />
        <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" className="fill-subtle" />
      </svg>
      <span className="font-display text-h4 lowercase group-data-[collapsed=true]/sidebar:hidden">
        glyph
      </span>
    </Link>
  )
}

function DocsSidebar({ pathname }: { pathname: string }) {
  return (
    <Sidebar>
      <SidebarHeader className="justify-between">
        <Brand />
        <Badge variant="outline" className="group-data-[collapsed=true]/sidebar:hidden">
          v0.1
        </Badge>
      </SidebarHeader>
      <SidebarContent>
        <SidebarSection>
          <SidebarItem href="/" icon={<BookOpen />} active={pathname === '/'}>
            Introduction
          </SidebarItem>
          <SidebarItem
            href="/getting-started"
            icon={<Rocket />}
            active={pathname === '/getting-started'}
          >
            Getting started
          </SidebarItem>
          <SidebarItem href="/components" icon={<LayoutGrid />} active={pathname === '/components'}>
            All components
          </SidebarItem>
        </SidebarSection>
        {docsByCategory().map(({ category, items }) => (
          <SidebarSection key={category} label={category}>
            {items.map((doc) => (
              <SidebarItem
                key={doc.slug}
                href={`/components/${doc.slug}`}
                active={pathname === `/components/${doc.slug}`}
                badge={doc.status === 'beta' ? 'beta' : undefined}
              >
                {doc.name}
              </SidebarItem>
            ))}
          </SidebarSection>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

const modeIcon = { dark: <Moon />, light: <Sun />, system: <Monitor /> }
const nextMode: Record<ColorModePreference, ColorModePreference> = {
  dark: 'light',
  light: 'system',
  system: 'dark',
}

function TopBar() {
  const { theme, setTheme } = useThemeChoice()
  const { mode, setMode } = useColorMode()
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b-(length:--glyph-border-width) border-border bg-background/80 px-4 backdrop-blur-xl sm:px-8 max-md:top-14">
      <div className="hidden md:block">
        <SidebarTrigger />
      </div>
      <SearchCommand />
      <div className="ml-auto flex items-center gap-1.5">
        <Select<PresetName>
          value={theme}
          onValueChange={setTheme}
          size="sm"
          aria-label="Theme"
          className="w-32"
        >
          {(Object.keys(presets) as PresetName[]).map((name) => (
            <SelectItem key={name} value={name}>
              {name[0]!.toUpperCase() + name.slice(1)}
            </SelectItem>
          ))}
        </Select>
        <Tooltip content={`Color mode: ${mode}`}>
          <IconButton
            size="sm"
            icon={modeIcon[mode]}
            aria-label={`Color mode: ${mode}`}
            onClick={() => setMode(nextMode[mode])}
          />
        </Tooltip>
        <Tooltip content="GitHub">
          <Button variant="ghost" size="sm" iconOnly asChild>
            <a href={REPO} aria-label="GitHub repository">
              <Github className="size-4" />
            </a>
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
