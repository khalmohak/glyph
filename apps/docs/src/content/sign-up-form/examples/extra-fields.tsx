import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SignUpForm } from '@glyphui/auth/ui'
import { toast } from '@glyphui/ui'

const adapter = memoryAdapter({ latency: 500, requireEmailVerification: false })

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SignUpForm
        headingLevel={3}
        title="Join your team"
        collectName={false}
        providers={[]}
        extraFields={[
          {
            name: 'inviteCode',
            label: 'Invite code',
            description: 'From the invitation email.',
            required: 'Enter your invite code.',
            validate: (value) =>
              /^INV-\d+$/.test(value) ? undefined : 'Codes look like INV-1234.',
          },
          { name: 'workspace', label: 'Workspace name', placeholder: 'Acme Inc.' },
        ]}
        onSuccess={(session) => toast.success(`Welcome, ${session.user.email}`)}
      />
    </AuthProvider>
  )
}
