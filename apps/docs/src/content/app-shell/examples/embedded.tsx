import {
  AppShell,
  PageHeader,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarItem,
  SidebarTrigger,
  Text,
} from '@glyphui/ui'
import { CircleDot, Inbox, SquareKanban } from 'lucide-react'

export default function Example() {
  return (
    <div className="h-96 overflow-hidden rounded-lg border border-border">
      <AppShell
        layout="embedded"
        mobileBrand={<span className="text-small font-semibold">Acme</span>}
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <span className="truncate text-small font-semibold">Acme Inc.</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarItem icon={<Inbox />} badge={3}>
                Inbox
              </SidebarItem>
              <SidebarItem icon={<CircleDot />} active>
                Issues
              </SidebarItem>
              <SidebarItem icon={<SquareKanban />}>Projects</SidebarItem>
            </SidebarContent>
          </Sidebar>
        }
      >
        <div className="grid gap-4 p-5">
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          <PageHeader title="Issues" description="12 open, 3 due this week." />
          <Text tone="muted">Your page content goes here.</Text>
        </div>
      </AppShell>
    </div>
  )
}
