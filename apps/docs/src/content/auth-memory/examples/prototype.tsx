import { AuthProvider, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SignInForm } from '@glyphui/auth/ui'
import { Button, Text, toast } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 500,
  users: [
    { email: 'ada@example.com', password: 'correct horse', name: 'Ada Lovelace' },
    { email: 'grace@example.com', password: 'cobol rules', name: 'Grace Hopper', twoFactor: true },
  ],
  onCode: ({ kind, email, code }) =>
    toast(`Email to ${email}`, { description: `${kind}: ${code}` }),
})

function Demo() {
  const { user, signOut } = useAuth()
  if (user)
    return (
      <div className="grid justify-items-center gap-3">
        <Text>Signed in as {user.name}.</Text>
        <Button variant="outline" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    )
  return (
    <SignInForm
      headingLevel={3}
      description="Try ada@example.com / correct horse, or grace@example.com / cobol rules for two steps."
    />
  )
}

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <Demo />
    </AuthProvider>
  )
}
