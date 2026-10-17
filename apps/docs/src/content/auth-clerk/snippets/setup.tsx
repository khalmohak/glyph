import { ClerkProvider } from '@clerk/react'
import { ClerkAuthBridge } from '@glyphui/auth/clerk'
import { RequireAuth } from '@glyphui/auth/react-router'
import { SignInForm } from '@glyphui/auth/ui'
import { GlyphProvider } from '@glyphui/ui'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <GlyphProvider>
        <ClerkAuthBridge oauthProviders={['google', 'github']}>{children}</ClerkAuthBridge>
      </GlyphProvider>
    </ClerkProvider>
  )
}

// Everything else is the same as with any adapter:
export const signInPage = <SignInForm signUpHref="/sign-up" />
export const protectedApp = <RequireAuth redirectTo="/sign-in" />
