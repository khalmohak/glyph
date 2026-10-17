import { AuthProvider, Can, createAuthClient, useAuth } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { GuestOnly, protectedLoader, RequireAuth, RequireRole } from '@glyphui/auth/react-router'
import { restAdapter } from '@glyphui/auth/rest'
import { SessionExpiredDialog, SignInForm, UserMenu } from '@glyphui/auth/ui'
import { createMemoryRouter, RouterProvider } from 'react-router'

declare module '@glyphui/auth' {
  interface Register {
    user: { id: string; email: string; name?: string; plan?: 'free' | 'pro' }
  }
}

// Type-check a production-style setup without calling it.
export const production = () =>
  createAuthClient(
    restAdapter({ baseUrl: '/api', mode: 'bearer', csrf: { header: 'X-CSRF', cookie: 'csrf' } }),
    { idleTimeout: 30 * 60_000 },
  )

const auth = createAuthClient(
  memoryAdapter({
    latency: 0,
    users: [{ email: 'ada@example.com', password: 'pw', roles: ['admin'] }],
  }),
)

function Plan() {
  const { user } = useAuth()
  const plan: 'free' | 'pro' | undefined = user?.plan
  return <p>{plan ?? 'free'}</p>
}

const router = createMemoryRouter([
  {
    path: '/',
    element: (
      <GuestOnly redirectTo="/app">
        <SignInForm signUpHref="/sign-up" />
      </GuestOnly>
    ),
  },
  {
    path: '/app',
    loader: protectedLoader(auth),
    element: (
      <RequireAuth redirectTo="/">
        <UserMenu />
        <Plan />
        <RequireRole roles="admin">
          <Can permission="billing:manage" fallback={<p>No billing access</p>}>
            <p>Billing</p>
          </Can>
        </RequireRole>
      </RequireAuth>
    ),
  },
])

export function AuthDemo() {
  return (
    <AuthProvider client={auth}>
      <RouterProvider router={router} />
      <SessionExpiredDialog />
    </AuthProvider>
  )
}
