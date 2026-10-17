/**
 * Augment this to type `user` everywhere (useAuth, guards, UserMenu):
 *
 * ```ts
 * declare module '@glyphui/auth' {
 *   interface Register {
 *     user: { id: string; email: string; name: string; plan: 'free' | 'pro' }
 *   }
 * }
 * ```
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmented by apps
export interface Register {}

/** The user shape when the app hasn't registered its own. */
export interface DefaultUser {
  id: string
  email: string
  name?: string | undefined
  image?: string | undefined
  emailVerified?: boolean | undefined
}

/** The signed-in user: the app's registered type, or `DefaultUser`. */
export type AuthUser = Register extends { user: infer U } ? U : DefaultUser

export interface Organization {
  id: string
  name: string
  image?: string | undefined
  /** The user's role in this organization. */
  role?: string | undefined
}

export interface AuthSession {
  user: AuthUser
  /** Unix time in milliseconds. The client refreshes before this when the adapter can. */
  expiresAt?: number | undefined
  roles?: readonly string[] | undefined
  /** Permission strings such as `invoices:write`. `invoices:*` and `*` act as wildcards. */
  permissions?: readonly string[] | undefined
  organizations?: readonly Organization[] | undefined
  activeOrganizationId?: string | undefined
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type OAuthProvider = 'google' | 'github' | 'apple' | 'microsoft' | (string & {})

export type SignInInput =
  | { email: string; password: string }
  | { provider: OAuthProvider }
  /** Passwordless: email the user a sign-in link. */
  | { email: string; magicLink: true }

export interface SignUpInput {
  email: string
  password: string
  name?: string | undefined
}

/** What happened after a sign-in or sign-up attempt. */
export type SignInResult =
  | { status: 'signed-in'; session: AuthSession }
  /** The account exists but the email must be confirmed with a code first. */
  | { status: 'needs-verification'; email: string }
  /** The password was right; a second factor (authenticator code) is required. */
  | { status: 'needs-second-factor' }
  | { status: 'magic-link-sent'; email: string }
  /** The browser is leaving for an OAuth provider or a hosted page. */
  | { status: 'redirecting' }

/** Which flows an adapter supports. Screens hide what isn't available. */
export interface AuthCapabilities {
  signUp: boolean
  passwordReset: boolean
  /**
   * How a password reset proves the user owns the email: a `link` with a token (the default)
   * or a `code` typed into the form.
   */
  passwordResetMethod?: 'link' | 'code' | undefined
  /** Email verification with a one-time code. */
  emailCode: boolean
  magicLink: boolean
  twoFactor: boolean
  organizations: boolean
  oauthProviders: readonly OAuthProvider[]
}

/**
 * Connects Glyph to an auth backend. Only `capabilities`, `getSession`, `signIn` and
 * `signOut` are required; the rest unlock flows the capability flags announce.
 */
export interface AuthAdapter {
  capabilities: AuthCapabilities
  /** The current session, or null when signed out. Called on start, on focus and on refresh. */
  getSession(): Promise<AuthSession | null>
  signIn(input: SignInInput): Promise<SignInResult>
  signOut(): Promise<void>
  signUp?(input: SignUpInput): Promise<SignInResult>
  /** Renews the session (e.g. rotates a refresh token). Null means the session is gone. */
  refresh?(): Promise<AuthSession | null>
  requestPasswordReset?(email: string): Promise<void>
  /**
   * `token` is the link token or the emailed code. For code-based resets `email` is set too:
   * a short code alone must never identify the account.
   */
  resetPassword?(input: {
    token: string
    password: string
    email?: string | undefined
  }): Promise<void>
  verifyEmail?(input: { email: string; code: string }): Promise<SignInResult>
  resendVerification?(email: string): Promise<void>
  verifySecondFactor?(input: { code: string }): Promise<SignInResult>
  switchOrganization?(organizationId: string): Promise<AuthSession>
  updateUser?(patch: Partial<AuthUser>): Promise<AuthSession>
  /** Headers `authFetch` adds to requests, e.g. a bearer token. */
  getAuthHeaders?(): Record<string, string> | Promise<Record<string, string>>
  /** Credentials mode for `authFetch`. Cookie sessions need `include` across origins. */
  credentials?: RequestCredentials
  /** Push-based backends (Firebase, Clerk) report session changes here. */
  subscribe?(listener: (session: AuthSession | null) => void): () => void
}
