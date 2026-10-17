import { createAuthClient } from '@glyphui/auth'
import { restAdapter } from '@glyphui/auth/rest'

export const auth = createAuthClient(
  restAdapter({
    baseUrl: '/api',
    mode: 'bearer',
    // 'local' (default) survives reloads and syncs tabs; 'session' lasts per tab;
    // 'memory' is safest from XSS but signs out on reload.
    storage: 'local',
    endpoints: { signIn: '/auth/login', signOut: '/auth/logout' },
    // Your API returns { data: { account, ... } }? Map it.
    mapSession: (body) => {
      const data = body.data as { account: { id: string; email: string; displayName: string } }
      return {
        user: { id: data.account.id, email: data.account.email, name: data.account.displayName },
      }
    },
  }),
)
