import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { Avatar, Badge, Button, Card, Text } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 400,
  users: [{ email: 'ada@example.com', password: 'correct horse', name: 'Ada Lovelace' }],
})

function SessionCard() {
  const { status, user, signIn, signOut } = useAuth()
  return (
    <Card className="w-full max-w-sm gap-4">
      <div className="flex items-center justify-between gap-3">
        <Text weight="medium">Session</Text>
        <Badge tone={status === 'authenticated' ? 'success' : 'neutral'} dot>
          {status}
        </Badge>
      </div>
      {user ? (
        <div className="flex items-center gap-3">
          <Avatar name={user.name ?? user.email} />
          <div className="grid">
            <Text weight="medium">{user.name}</Text>
            <Text size="small" tone="muted">
              {user.email}
            </Text>
          </div>
        </div>
      ) : (
        <Text size="small" tone="muted">
          Nobody is signed in.
        </Text>
      )}
      {user ? (
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      ) : (
        <Button
          disabled={status === 'loading'}
          onClick={() => signIn({ email: 'ada@example.com', password: 'correct horse' })}
        >
          Sign in as Ada
        </Button>
      )}
    </Card>
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SessionCard />
    </AuthProvider>
  )
}
