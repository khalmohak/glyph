import { AppShell, Sidebar, SidebarContent, SidebarItem, SidebarTrigger, Text } from '@glyphui/ui'
import { CircleDot, Inbox, SquareKanban } from 'lucide-react'

export default function Example() {
  return (
    <div className="h-72 overflow-hidden rounded-lg border border-border">
      <AppShell
        layout="embedded"
        defaultCollapsed
        sidebar={
          <Sidebar>
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
        <div className="flex items-center gap-2 p-4">
          <SidebarTrigger />
          <Text size="small" tone="muted">
            Toggle the rail
          </Text>
        </div>
      </AppShell>
    </div>
  )
}
