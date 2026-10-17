import { AuthProvider, createAuthClient } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'

const adapter = memoryAdapter({
  latency: 0,
  onCode: () => {},
  users: [{ email: 'ada@example.com', password: 'pw', roles: ['admin'] }],
})
const auth = createAuthClient(adapter, { syncTabs: false, refreshOnFocus: false })

export async function signInAsAdmin() {
  await auth.signIn({ email: 'ada@example.com', password: 'pw' })
}

// After a sign-up, read the "emailed" code:
export const code = () => adapter.lastCode('new@example.com', 'verify-email')

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider client={auth}>{children}</AuthProvider>
)
