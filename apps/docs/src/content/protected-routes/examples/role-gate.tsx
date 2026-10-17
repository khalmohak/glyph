import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { RequireRole } from '@glyphui/auth/react-router'
import { Card, SegmentedControl, Text } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 0,
  users: [
    { email: 'admin@acme.dev', password: 'pw', name: 'Admin', roles: ['admin'] },
    { email: 'member@acme.dev', password: 'pw', name: 'Member', roles: ['member'] },
  ],
})

function AdminArea() {
  const { user, signIn } = useAuth()
  return (
    <div className="grid w-full max-w-md gap-4">
      <SegmentedControl
        aria-label="Signed in as"
        value={user?.email ?? ''}
        onValueChange={(email) => signIn({ email, password: 'pw' })}
        options={[
          { value: 'admin@acme.dev', label: 'Admin' },
          { value: 'member@acme.dev', label: 'Member' },
        ]}
      />
      {user && (
        <RequireRole roles="admin">
          <Card>
            <Text weight="medium">Audit log</Text>
            <Text size="small" tone="muted">
              Only admins see this card.
            </Text>
          </Card>
        </RequireRole>
      )}
    </div>
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <AdminArea />
    </AuthProvider>
  )
}
