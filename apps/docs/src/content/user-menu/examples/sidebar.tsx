import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { OrganizationSwitcher, UserMenu } from '@glyphui/auth/ui'
import { Button, Card, toast } from '@glyphui/ui'
import { CreditCard, Settings } from 'lucide-react'

const adapter = memoryAdapter({
  latency: 300,
  users: [
    {
      email: 'ada@example.com',
      password: 'pw',
      name: 'Ada Lovelace',
      organizations: [
        { id: 'engines', name: 'Analytical Engines', role: 'owner' },
        { id: 'difference', name: 'Difference Ltd', role: 'member' },
      ],
    },
  ],
})

function Panel() {
  const { user, signIn } = useAuth()
  if (!user)
    return (
      <Button onClick={() => signIn({ email: 'ada@example.com', password: 'pw' })}>
        Sign in as Ada
      </Button>
    )
  return (
    <Card padding="sm" className="flex h-72 w-64 flex-col justify-between">
      <OrganizationSwitcher onSwitch={(org) => toast.success(`Switched to ${org.name}`)} />
      <UserMenu
        side="top"
        align="start"
        className="w-full"
        items={[
          { label: 'Settings', href: '#settings', icon: <Settings /> },
          { label: 'Billing', href: '#billing', icon: <CreditCard /> },
        ]}
      />
    </Card>
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <Panel />
    </AuthProvider>
  )
}
