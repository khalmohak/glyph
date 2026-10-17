import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SocialButtons } from '@glyphui/auth/ui'
import { toast } from '@glyphui/ui'

const adapter = memoryAdapter({
  latency: 600,
  oauthProviders: ['google', 'github', 'apple', 'microsoft'],
})

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SocialButtons
        className="w-full max-w-xs"
        onSuccess={(session) => toast.success(`Signed in as ${session.user.email}`)}
      />
    </AuthProvider>
  )
}
