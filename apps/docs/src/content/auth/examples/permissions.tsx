import { AuthProvider, Can, useAuth, useCan } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { Button, Card, SegmentedControl, Text } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 0,
  users: [
    {
      email: 'owner@acme.dev',
      password: 'pw',
      name: 'Owner',
      permissions: ['invoices:*', 'billing:manage'],
    },
    { email: 'viewer@acme.dev', password: 'pw', name: 'Viewer', permissions: ['invoices:read'] },
  ],
})

function Invoices() {
  const { user, signIn } = useAuth()
  const canEdit = useCan('invoices:write')
  return (
    <Card className="w-full max-w-md gap-4">
      <SegmentedControl
        aria-label="Signed in as"
        value={user?.email ?? ''}
        onValueChange={(email) => signIn({ email, password: 'pw' })}
        options={[
          { value: 'owner@acme.dev', label: 'Owner' },
          { value: 'viewer@acme.dev', label: 'Viewer' },
        ]}
      />
      <Text size="small" tone="muted">
        {user ? `${user.name} can ${canEdit ? 'edit' : 'only read'} invoices.` : 'Pick a user.'}
      </Text>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={!canEdit}>
          Edit invoice
        </Button>
        <Can permission="billing:manage" fallback={<Button disabled>Billing (owners only)</Button>}>
          <Button>Manage billing</Button>
        </Can>
      </div>
    </Card>
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <Invoices />
    </AuthProvider>
  )
}
