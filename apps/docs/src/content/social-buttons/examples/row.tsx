import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { SocialButtons } from '@glyphui/auth/ui'

const adapter = memoryAdapter({ latency: 600 })

export default function Example() {
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <SocialButtons
        layout="row"
        providers={['google', 'github', 'microsoft']}
        className="w-full max-w-md"
      />
    </AuthProvider>
  )
}
