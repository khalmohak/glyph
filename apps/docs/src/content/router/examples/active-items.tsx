import { AppShell, Sidebar, SidebarContent, SidebarItem, SidebarSection, Text } from '@glyphui/ui'
import { BookOpen, LayoutGrid, PanelLeft, Route } from 'lucide-react'

export default function Example() {
  return (
    <div className="h-72 overflow-hidden rounded-lg border border-border">
      <AppShell
        layout="embedded"
        sidebar={
          <Sidebar>
            <SidebarContent>
              <SidebarSection label="Docs">
                <SidebarItem href="/components" end icon={<LayoutGrid />}>
                  All components
                </SidebarItem>
                <SidebarItem href="/components/router" icon={<Route />}>
                  Router integration
                </SidebarItem>
                <SidebarItem href="/components/sidebar" icon={<PanelLeft />}>
                  Sidebar
                </SidebarItem>
                <SidebarItem href="/getting-started" icon={<BookOpen />}>
                  Getting started
                </SidebarItem>
              </SidebarSection>
            </SidebarContent>
          </Sidebar>
        }
      >
        <div className="p-5">
          <Text tone="muted">
            No item sets active. “Router integration” is highlighted because it matches this page.
          </Text>
        </div>
      </AppShell>
    </div>
  )
}
