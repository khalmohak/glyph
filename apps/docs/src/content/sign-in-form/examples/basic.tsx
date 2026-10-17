import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SignInForm } from '@glyphui/auth/ui'
import { toast } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 500,
  oauthProviders: ['google', 'github'],
  users: [{ email: 'ada@example.com', password: 'correct horse', name: 'Ada Lovelace' }],
})

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SignInForm
        headingLevel={3}
        magicLink={false}
        signUpHref="#sign-up"
        forgotPasswordHref="#forgot-password"
        onSuccess={(session) => toast.success(`Signed in as ${session.user.name}`)}
      />
    </AuthProvider>
  )
}
