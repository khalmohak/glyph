import {
  AppShell,
  Avatar,
  type ColorModePreference,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandMenu,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Kbd,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarTrigger,
  useColorMode,
  useCommandMenuShortcut,
} from '@glyphui/ui'
import { FileText, Home, LogOut, Search, Settings, Users } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { invoices } from '../data'

const nav = [
  { href: '/app', label: 'Dashboard', icon: <Home /> },
  { href: '/app/invoices', label: 'Invoices', icon: <FileText /> },
  { href: '/app/customers', label: 'Customers', icon: <Users /> },
]

export function AppLayout() {
  const navigate = useNavigate()
  const { mode, setMode } = useColorMode()
  const [searchOpen, setSearchOpen] = useState(false)
  useCommandMenuShortcut(setSearchOpen)
  const overdue = invoices.filter((i) => i.status === 'overdue').length

  return (
    <AppShell
      mobileBrand={<span className="text-small font-semibold">Ledgerline</span>}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <span className="truncate text-small font-semibold">Ledgerline</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarSection>
              <SidebarItem icon={<Search />} onClick={() => setSearchOpen(true)}>
                Search <Kbd className="ml-auto">⌘K</Kbd>
              </SidebarItem>
            </SidebarSection>
            <SidebarSection label="Workspace">
              {nav.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  end={item.href === '/app'}
                  badge={item.label === 'Invoices' ? overdue : undefined}
                >
                  {item.label}
                </SidebarItem>
              ))}
            </SidebarSection>
            <SidebarSection label="Account">
              <SidebarItem href="/app/settings" icon={<Settings />}>
                Settings
              </SidebarItem>
            </SidebarSection>
          </SidebarContent>
          <SidebarFooter>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1 text-left hover:bg-muted">
                <Avatar name="Ada Lovelace" size="sm" />
                <span className="truncate text-small font-medium">Ada Lovelace</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top">
                <DropdownMenuRadioGroup
                  value={mode}
                  onValueChange={(value) => setMode(value as ColorModePreference)}
                >
                  <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<LogOut />} onSelect={() => navigate('/sign-in')}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <div className="mx-auto grid w-full max-w-6xl gap-6 p-4 md:p-8">
        <div className="hidden md:block">
          <SidebarTrigger />
        </div>
        <Outlet />
      </div>

      <CommandMenu open={searchOpen} onOpenChange={setSearchOpen} label="Search Ledgerline">
        <CommandInput placeholder="Search pages and invoices…" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          <CommandGroup heading="Pages">
            {[...nav, { href: '/app/settings', label: 'Settings', icon: <Settings /> }].map(
              (item) => (
                <CommandItem key={item.href} icon={item.icon} onSelect={() => navigate(item.href)}>
                  {item.label}
                </CommandItem>
              ),
            )}
          </CommandGroup>
          <CommandGroup heading="Invoices">
            {invoices.slice(0, 8).map((invoice) => (
              <CommandItem
                key={invoice.id}
                icon={<FileText />}
                value={`${invoice.id} ${invoice.customer}`}
                onSelect={() => navigate(`/app/invoices?q=${invoice.id}`)}
              >
                {invoice.id} · {invoice.customer}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandMenu>
    </AppShell>
  )
}
