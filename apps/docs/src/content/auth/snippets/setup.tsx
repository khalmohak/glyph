// auth.ts
import { AuthProvider, createAuthClient } from '@glyphui/auth'
import { restAdapter } from '@glyphui/auth/rest'
import { GlyphProvider } from '@glyphui/ui'
import type { ReactNode } from 'react'

export const auth = createAuthClient(restAdapter({ baseUrl: '/api' }), {
  idleTimeout: 30 * 60_000, // optional: sign out after 30 idle minutes
})

// main.tsx
export function Providers({ children }: { children: ReactNode }) {
  return (
    <GlyphProvider>
      <AuthProvider client={auth}>{children}</AuthProvider>
    </GlyphProvider>
  )
}
