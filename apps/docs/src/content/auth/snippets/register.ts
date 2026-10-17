// auth.d.ts, anywhere in your app
import type { AuthUser } from '@glyphui/auth'

declare module '@glyphui/auth' {
  interface Register {
    user: {
      id: string
      email: string
      name?: string
      plan?: 'free' | 'pro'
    }
  }
}

// Every API now uses it: `useAuth().user?.plan` is 'free' | 'pro' | undefined.
export type Plan = NonNullable<AuthUser['plan']>
