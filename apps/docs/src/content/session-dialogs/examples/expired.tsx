import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SessionExpiredDialog } from '@glyphui/auth/ui'
import { Button, Text, toast } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 300,
  users: [{ email: 'ada@example.com', password: 'pw', name: 'Ada Lovelace' }],
})

function Demo() {
  const { user, signIn, refresh } = useAuth()
  if (!user)
    return (
      <Button onClick={() => signIn({ email: 'ada@example.com', password: 'pw' })}>
        Sign in as Ada
      </Button>
    )
  return (
    <div className="grid justify-items-center gap-3">
      <Text tone="muted">Signed in as {user.name}.</Text>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            adapter.expireSession()
            toast('Session revoked on the server')
          }}
        >
          Revoke session
        </Button>
        {/* Any API call through auth.fetch would do the same; refresh() asks the server directly. */}
        <Button onClick={() => refresh()}>Call the API</Button>
      </div>
    </div>
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <Demo />
      <SessionExpiredDialog />
    </AuthProvider>
  )
}
