import { useClerk, useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/react'
import { type ReactNode, useEffect, useState } from 'react'
import { type AuthClient, type AuthClientOptions, createAuthClient } from '../core/client'
import { AuthError, type AuthErrorCode } from '../core/errors'
import type {
  AuthAdapter,
  AuthSession,
  AuthUser,
  OAuthProvider,
  Organization,
  SignInResult,
} from '../core/types'
import { AuthProvider } from '../react/provider'

/** The parts of Clerk's user object the bridge reads. */
export interface ClerkUserLike {
  id: string
  fullName: string | null
  imageUrl: string
  primaryEmailAddress: {
    emailAddress: string
    verification?: { status: string | null } | null
  } | null
  publicMetadata: Record<string, unknown>
  organizationMemberships?: readonly {
    organization: { id: string; name: string; imageUrl?: string }
    role: string
  }[]
}

interface ClerkResource {
  status: string | null
  createdSessionId: string | null
  [key: string]: unknown
}

/** The parts of Clerk's client object the bridge calls. Matches `useClerk()`. */
export interface ClerkLike {
  client?: {
    signIn: {
      create(params: Record<string, unknown>): Promise<ClerkResource>
      authenticateWithRedirect(params: Record<string, unknown>): Promise<unknown>
    }
    signUp: { create(params: Record<string, unknown>): Promise<ClerkResource> }
  } | null
  setActive(params: { session?: string | null; organization?: string | null }): Promise<void>
  signOut(): Promise<void>
}

interface Snapshot {
  isLoaded: boolean
  isSignedIn: boolean
  user: ClerkUserLike | null
  orgId: string | null
  orgRole: string | null
  getToken: () => Promise<string | null>
  clerk: ClerkLike
}

export interface ClerkBridgeOptions {
  /** Social buttons to offer. Default Google and GitHub. */
  oauthProviders?: OAuthProvider[]
  /** Where Clerk returns after OAuth. Render Clerk's `<AuthenticateWithRedirectCallback />` there. */
  oauthCallbackUrl?: string
  /** Where to land after OAuth completes. Default `/`. */
  afterOAuthUrl?: string
  /** Turns a Clerk user into your app's user type. */
  mapUser?: (user: ClerkUserLike) => AuthUser
}

function clerkError(error: unknown): AuthError {
  const first = (
    error as {
      errors?: {
        code?: string
        message?: string
        longMessage?: string
        meta?: { paramName?: string }
      }[]
    }
  )?.errors?.[0]
  if (!first) return new AuthError('Something went wrong. Try again.', { cause: error })
  const message = first.longMessage ?? first.message ?? 'Something went wrong. Try again.'
  const codes: Record<string, AuthErrorCode> = {
    form_password_incorrect: 'invalid-credentials',
    form_identifier_not_found: 'invalid-credentials',
    form_identifier_exists: 'email-taken',
    form_password_pwned: 'weak-password',
    form_password_length_too_short: 'weak-password',
    form_code_incorrect: 'invalid-code',
    too_many_requests: 'rate-limited',
  }
  const fieldByParam: Record<string, string> = {
    identifier: 'email',
    email_address: 'email',
    password: 'password',
    code: 'code',
  }
  const field = first.meta?.paramName ? fieldByParam[first.meta.paramName] : undefined
  return new AuthError(message, {
    code: (first.code && codes[first.code]) || 'unknown',
    cause: error,
    ...(field && { fieldErrors: { [field]: message } }),
  })
}

/**
 * Wraps Clerk's hook state in a Glyph adapter. Exposed for tests and custom setups;
 * most apps render `<ClerkAuthBridge>` instead.
 */
export function createClerkBridge(options: ClerkBridgeOptions = {}) {
  const {
    oauthProviders = ['google', 'github'],
    oauthCallbackUrl = '/sso-callback',
    afterOAuthUrl = '/',
    mapUser,
  } = options
  let snapshot: Snapshot | null = null
  const listeners = new Set<(session: AuthSession | null) => void>()
  const waiting: ((snapshot: Snapshot) => void)[] = []
  // In-progress multi-step flows (second factor, email code, reset code).
  let pendingSignIn: ClerkResource | null = null
  let pendingSignUp: ClerkResource | null = null
  let lastKey: string | undefined

  function toSession(s: Snapshot): AuthSession | null {
    if (!s.isSignedIn || !s.user) return null
    const user = s.user
    const metadata = user.publicMetadata ?? {}
    const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : [])
    const organizations: Organization[] = (user.organizationMemberships ?? []).map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      image: m.organization.imageUrl,
      role: m.role,
    }))
    return {
      user:
        mapUser?.(user) ??
        ({
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          name: user.fullName ?? undefined,
          image: user.imageUrl,
          emailVerified: user.primaryEmailAddress?.verification?.status === 'verified',
        } as AuthUser),
      roles: [...list(metadata.roles), ...(s.orgRole ? [s.orgRole] : [])],
      permissions: list(metadata.permissions),
      ...(organizations.length > 0 && {
        organizations,
        activeOrganizationId: s.orgId ?? undefined,
      }),
    }
  }

  const loaded = () =>
    snapshot?.isLoaded
      ? Promise.resolve(snapshot)
      : new Promise<Snapshot>((resolve) => waiting.push(resolve))

  /** Resolves once Clerk's hooks report the new session after `setActive`. */
  function signedInSession(): Promise<AuthSession> {
    return new Promise((resolve) => {
      const current = snapshot && toSession(snapshot)
      if (current) return resolve(current)
      const listener = (session: AuthSession | null) => {
        if (!session) return
        listeners.delete(listener)
        resolve(session)
      }
      listeners.add(listener)
    })
  }

  async function finish(resource: ClerkResource): Promise<SignInResult> {
    const clerk = (await loaded()).clerk
    await clerk.setActive({ session: resource.createdSessionId })
    pendingSignIn = null
    pendingSignUp = null
    return { status: 'signed-in', session: await signedInSession() }
  }

  async function client() {
    const clerk = (await loaded()).clerk
    if (!clerk.client) throw new AuthError('Clerk isn’t ready yet. Try again.')
    return clerk.client
  }

  async function attempt<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action()
    } catch (error) {
      throw error instanceof AuthError ? error : clerkError(error)
    }
  }

  const adapter: AuthAdapter = {
    capabilities: {
      signUp: true,
      passwordReset: true,
      passwordResetMethod: 'code',
      emailCode: true,
      magicLink: false,
      twoFactor: true,
      organizations: true,
      oauthProviders,
    },
    async getSession() {
      return toSession(await loaded())
    },
    signIn: (input) =>
      attempt(async () => {
        const signIn = (await client()).signIn
        if ('provider' in input) {
          await signIn.authenticateWithRedirect({
            strategy: `oauth_${input.provider}`,
            redirectUrl: oauthCallbackUrl,
            redirectUrlComplete: afterOAuthUrl,
          })
          return { status: 'redirecting' }
        }
        if ('magicLink' in input)
          throw new AuthError('Email links aren’t enabled.', { code: 'not-supported' })
        const result = await signIn.create({ identifier: input.email, password: input.password })
        if (result.status === 'complete') return finish(result)
        if (result.status === 'needs_second_factor') {
          pendingSignIn = result
          return { status: 'needs-second-factor' }
        }
        throw new AuthError('This account needs a step Glyph can’t show. Use Clerk’s sign-in page.')
      }),
    signUp: (input) =>
      attempt(async () => {
        const [firstName, ...rest] = (input.name ?? '').trim().split(/\s+/)
        const result = await (await client()).signUp.create({
          emailAddress: input.email,
          password: input.password,
          ...(firstName && { firstName, lastName: rest.join(' ') || undefined }),
        })
        if (result.status === 'complete') return finish(result)
        const prepare = result.prepareEmailAddressVerification as
          | ((params: { strategy: string }) => Promise<unknown>)
          | undefined
        await prepare?.call(result, { strategy: 'email_code' })
        pendingSignUp = result
        return { status: 'needs-verification', email: input.email }
      }),
    async signOut() {
      await (await loaded()).clerk.signOut()
    },
    verifyEmail: ({ code }) =>
      attempt(async () => {
        const attemptVerification = pendingSignUp?.attemptEmailAddressVerification as
          | ((params: { code: string }) => Promise<ClerkResource>)
          | undefined
        if (!pendingSignUp || !attemptVerification)
          throw new AuthError('Start again from the sign-up page.', { code: 'session-expired' })
        const result = await attemptVerification.call(pendingSignUp, { code })
        if (result.status === 'complete') return finish(result)
        throw new AuthError('That code isn’t right.', { code: 'invalid-code' })
      }),
    resendVerification: () =>
      attempt(async () => {
        const prepare = pendingSignUp?.prepareEmailAddressVerification as
          | ((params: { strategy: string }) => Promise<unknown>)
          | undefined
        await prepare?.call(pendingSignUp, { strategy: 'email_code' })
      }),
    verifySecondFactor: ({ code }) =>
      attempt(async () => {
        const attemptSecond = pendingSignIn?.attemptSecondFactor as
          | ((params: { strategy: string; code: string }) => Promise<ClerkResource>)
          | undefined
        if (!pendingSignIn || !attemptSecond)
          throw new AuthError('Sign in again to continue.', { code: 'session-expired' })
        const result = await attemptSecond.call(pendingSignIn, { strategy: 'totp', code })
        if (result.status === 'complete') return finish(result)
        throw new AuthError('That code isn’t right.', { code: 'invalid-code' })
      }),
    requestPasswordReset: (email) =>
      attempt(async () => {
        pendingSignIn = await (await client()).signIn.create({
          strategy: 'reset_password_email_code',
          identifier: email,
        })
      }),
    resetPassword: ({ token, password }) =>
      attempt(async () => {
        const attemptFirst = pendingSignIn?.attemptFirstFactor as
          | ((params: Record<string, string>) => Promise<ClerkResource>)
          | undefined
        if (!pendingSignIn || !attemptFirst)
          throw new AuthError('Request a new code first.', { code: 'expired-token' })
        const result = await attemptFirst.call(pendingSignIn, {
          strategy: 'reset_password_email_code',
          code: token,
          password,
        })
        if (result.status === 'complete') await finish(result)
      }),
    async switchOrganization(organizationId) {
      await (await loaded()).clerk.setActive({ organization: organizationId })
      return signedInSession()
    },
    async getAuthHeaders(): Promise<Record<string, string>> {
      const token = await snapshot?.getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }

  return {
    adapter,
    /** Feed the latest Clerk hook values in. */
    update(next: Snapshot) {
      snapshot = next
      if (!next.isLoaded) return
      for (const resolve of waiting.splice(0)) resolve(next)
      const session = toSession(next)
      // Clerk re-renders often; only report real changes.
      const key = JSON.stringify(session)
      if (key === lastKey) return
      lastKey = key
      for (const listener of [...listeners]) listener(session)
    },
  }
}

export type ClerkAuthBridgeProps = ClerkBridgeOptions &
  AuthClientOptions & {
    children: ReactNode
  }

/**
 * Use Glyph's guards, `useAuth()` and screens with Clerk. Render inside `<ClerkProvider>`:
 *
 * ```tsx
 * <ClerkProvider publishableKey={key}>
 *   <ClerkAuthBridge>
 *     <App />
 *   </ClerkAuthBridge>
 * </ClerkProvider>
 * ```
 *
 * Glyph's forms handle email and password, codes and second factors. OAuth redirects
 * through Clerk; render Clerk's `<AuthenticateWithRedirectCallback />` at `oauthCallbackUrl`.
 * Flows Glyph doesn't model (passkeys, enterprise SSO, CAPTCHA) need Clerk's own components.
 */
export function ClerkAuthBridge({
  children,
  oauthProviders,
  oauthCallbackUrl,
  afterOAuthUrl,
  mapUser,
  ...clientOptions
}: ClerkAuthBridgeProps) {
  const clerkAuth = useClerkAuth()
  const { user } = useClerkUser()
  const clerk = useClerk() as unknown as ClerkLike
  const [{ bridge, client }] = useState(() => {
    const bridge = createClerkBridge({
      ...(oauthProviders && { oauthProviders }),
      ...(oauthCallbackUrl && { oauthCallbackUrl }),
      ...(afterOAuthUrl && { afterOAuthUrl }),
      ...(mapUser && { mapUser }),
    })
    // Clerk refreshes its own tokens and syncs tabs; Glyph only mirrors its state.
    const client: AuthClient = createAuthClient(bridge.adapter, {
      refreshInterval: false,
      refreshOnFocus: false,
      syncTabs: false,
      ...clientOptions,
    })
    return { bridge, client }
  })

  useEffect(() => {
    bridge.update({
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: clerkAuth.isSignedIn === true,
      user: (user as unknown as ClerkUserLike | null | undefined) ?? null,
      orgId: clerkAuth.orgId ?? null,
      orgRole: clerkAuth.orgRole ?? null,
      getToken: () => clerkAuth.getToken(),
      clerk,
    })
  }, [bridge, clerkAuth, user, clerk])

  return <AuthProvider client={client}>{children}</AuthProvider>
}
