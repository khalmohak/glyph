import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { MagicLinkCallback } from '@glyphui/auth/ui'
import { Button } from '@glyphui/ui'
import { useState } from 'react'

const adapter = memoryAdapter({
  latency: 400,
  users: [{ email: 'ada@example.com', password: 'correct horse', name: 'Ada Lovelace' }],
  onCode: () => {},
})

function Demo() {
  const { signIn, signOut, user } = useAuth()
  const [token, setToken] = useState<string | null>(null)
  const [opened, setOpened] = useState(0)

  if (opened > 0 && token)
    return (
      <div className="grid w-full max-w-sm gap-3">
        <MagicLinkCallback key={opened} token={token} headingLevel={3} />
        <div className="flex flex-wrap justify-center gap-2">
          {user && (
            <Button variant="outline" size="sm" onClick={() => setOpened((n) => n + 1)}>
              Open the same link again
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (user) await signOut()
              setToken(null)
              setOpened(0)
            }}
          >
            Start over
          </Button>
        </div>
      </div>
    )

  return (
    <div className="grid justify-items-center gap-3">
      <Button
        onClick={async () => {
          await signIn({ email: 'ada@example.com', magicLink: true })
          setToken(adapter.lastCode('ada@example.com', 'magic-link') ?? null)
        }}
      >
        Email me a sign-in link
      </Button>
      {token && (
        <Button variant="outline" onClick={() => setOpened(1)}>
          Open the link from the email
        </Button>
      )}
    </div>
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <Demo />
    </AuthProvider>
  )
}
