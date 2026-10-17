import { describe, expectTypeOf, it } from 'vitest'
import type { AuthClient, AuthSession, AuthUser, SignInResult, UseAuthResult } from './index'

// An app registers its own user type once; every API is typed with it.
declare module './core/types' {
  interface Register {
    user: { id: string; email: string; name?: string; plan?: 'free' | 'pro' }
  }
}

describe('Register', () => {
  it('types the user everywhere', () => {
    expectTypeOf<AuthUser>().toEqualTypeOf<{
      id: string
      email: string
      name?: string
      plan?: 'free' | 'pro'
    }>()
    expectTypeOf<AuthSession['user']>().toEqualTypeOf<AuthUser>()
    expectTypeOf<UseAuthResult['user']>().toEqualTypeOf<AuthUser | null>()
    expectTypeOf<ReturnType<AuthClient['getState']>['user']>().toEqualTypeOf<AuthUser | null>()
  })

  it('narrows sign-in results by status', () => {
    const handle = (result: SignInResult) => {
      if (result.status === 'signed-in') expectTypeOf(result.session).toEqualTypeOf<AuthSession>()
      if (result.status === 'needs-verification') expectTypeOf(result.email).toBeString()
    }
    expectTypeOf(handle).toBeFunction()
  })
})
