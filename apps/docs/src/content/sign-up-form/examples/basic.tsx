import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SignUpForm } from '@glyphui/auth/ui'
import { Link, toast } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 500,
  oauthProviders: ['google'],
  users: [{ email: 'ada@example.com', password: 'correct horse' }],
  onCode: ({ email, code }) => toast(`Email to ${email}`, { description: `Your code: ${code}` }),
})

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SignUpForm
        headingLevel={3}
        description="Free for 14 days. No credit card required."
        signInHref="#sign-in"
        terms={
          <>
            By signing up you agree to the <Link href="#terms">Terms</Link> and{' '}
            <Link href="#privacy">Privacy Policy</Link>.
          </>
        }
        onSuccess={(session) => toast.success(`Welcome, ${session.user.name}`)}
      />
    </AuthProvider>
  )
}
