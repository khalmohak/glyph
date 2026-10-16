import {
  AppShell,
  Avatar,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  Text,
} from '@glyphui/ui'
import { CircleDot, Inbox, Layers, Users } from 'lucide-react'
import { useState } from 'react'

export default function Example() {
  const [active, setActive] = useState('issues')
  const item = (id: string) => ({ active: active === id, onClick: () => setActive(id) })
  return (
    <div className="h-[26rem] overflow-hidden rounded-lg border border-border">
      <AppShell
        layout="embedded"
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <span className="text-small font-semibold">Acme Inc.</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarSection>
                <SidebarItem icon={<Inbox />} badge={3} {...item('inbox')}>
                  Inbox
                </SidebarItem>
                <SidebarItem icon={<CircleDot />} badge={12} {...item('issues')}>
                  Issues
                </SidebarItem>
                <SidebarItem icon={<Layers />} {...item('views')}>
                  Views
                </SidebarItem>
              </SidebarSection>
              <SidebarSection label="Teams">
                <SidebarItem icon={<Users />} {...item('design')}>
                  Design
                </SidebarItem>
                <SidebarItem icon={<Users />} {...item('engineering')}>
                  Engineering
                </SidebarItem>
              </SidebarSection>
            </SidebarContent>
            <SidebarFooter>
              <Avatar name="Ada Lovelace" size="sm" />
              <span className="truncate text-small font-medium">Ada Lovelace</span>
            </SidebarFooter>
          </Sidebar>
        }
      >
        <div className="p-5">
          <Text tone="muted">Selected: {active}</Text>
        </div>
      </AppShell>
    </div>
  )
}
