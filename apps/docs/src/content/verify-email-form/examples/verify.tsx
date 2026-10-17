import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { VerifyEmailForm } from '@glyphui/auth/ui'
import { Button, toast } from '@glyphui/ui'
import { useState } from 'react'

const adapter = memoryAdapter({
  latency: 400,
  onCode: ({ email, code }) => toast(`Email to ${email}`, { description: `Your code: ${code}` }),
})

function Demo() {
  const { signUp, signOut, user } = useAuth()
  const [email, setEmail] = useState<string | null>(null)
  if (user)
    return (
      <Button
        variant="outline"
        onClick={async () => {
          await signOut()
          setEmail(null)
        }}
      >
        Verified {user.email}. Start over
      </Button>
    )
  if (!email)
    return (
      <Button
        onClick={async () => {
          const address = `new.${Date.now()}@example.com`
          await signUp({ email: address, password: 'long password' })
          setEmail(address)
        }}
      >
        Create a demo account
      </Button>
    )
  return <VerifyEmailForm headingLevel={3} email={email} onBack={() => setEmail(null)} />
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <Demo />
    </AuthProvider>
  )
}
