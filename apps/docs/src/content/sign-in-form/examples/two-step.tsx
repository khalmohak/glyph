import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SignInForm } from '@glyphui/auth/ui'
import { toast } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 500,
  oauthProviders: [],
  users: [
    { email: 'grace@example.com', password: 'cobol rules', name: 'Grace Hopper', twoFactor: true },
  ],
  onCode: ({ email, code }) => toast(`Email to ${email}`, { description: `Your code: ${code}` }),
})

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SignInForm
        headingLevel={3}
        onSuccess={(session) => toast.success(`Signed in as ${session.user.name}`)}
      />
    </AuthProvider>
  )
}
