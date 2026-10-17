import {
  type ActionCodeSettings,
  type Auth,
  type AuthProvider,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  OAuthProvider as FirebaseOAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  getIdTokenResult,
  onIdTokenChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
  updateProfile,
} from 'firebase/auth'
import { AuthError, type AuthErrorCode } from '../core/errors'
import type { AuthAdapter, AuthSession, AuthUser, OAuthProvider } from '../core/types'

export interface FirebaseAdapterOptions {
  /** Providers for the social buttons. Default Google and GitHub. */
  providers?: Partial<Record<OAuthProvider, AuthProvider>>
  /** `popup` (default) keeps the page; `redirect` works better on mobile Safari. */
  oauthFlow?: 'popup' | 'redirect'
  /** Block sign-in until the email is verified. Default true. */
  requireEmailVerification?: boolean
  /** Where verification and reset emails send the user back to. */
  actionCodeSettings?: ActionCodeSettings
  /** Custom claims (set with the Admin SDK) that hold roles and permissions. */
  rolesClaim?: string
  permissionsClaim?: string
  /** Turns a Firebase user into your app's user type. */
  mapUser?: (user: User, claims: Record<string, unknown>) => AuthUser
}

function defaultProviders(): Partial<Record<OAuthProvider, AuthProvider>> {
  return {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
    apple: new FirebaseOAuthProvider('apple.com'),
    microsoft: new FirebaseOAuthProvider('microsoft.com'),
  }
}

const messages: Record<string, [string, AuthErrorCode, string?]> = {
  'auth/invalid-credential': ['That email and password don’t match.', 'invalid-credentials'],
  'auth/wrong-password': ['That email and password don’t match.', 'invalid-credentials'],
  'auth/user-not-found': ['That email and password don’t match.', 'invalid-credentials'],
  'auth/invalid-email': ['Enter a valid email address.', 'unknown', 'email'],
  'auth/email-already-in-use': [
    'An account with this email already exists. Sign in instead.',
    'email-taken',
    'email',
  ],
  'auth/weak-password': ['Use a longer password.', 'weak-password', 'password'],
  'auth/too-many-requests': ['Too many attempts. Wait a minute and try again.', 'rate-limited'],
  'auth/expired-action-code': ['This link has expired. Request a new one.', 'expired-token'],
  'auth/invalid-action-code': ['This link has expired. Request a new one.', 'expired-token'],
  'auth/network-request-failed': [
    'Can’t reach the server. Check your connection and try again.',
    'network',
  ],
  'auth/popup-closed-by-user': ['Sign-in was cancelled.', 'unknown'],
}

/** Maps Firebase's error codes to messages a user can act on. */
export function firebaseError(error: unknown): AuthError {
  const code = (error as { code?: string } | null)?.code ?? ''
  const known = messages[code]
  if (!known) return new AuthError('Something went wrong. Try again.', { cause: error })
  const [message, authCode, field] = known
  return new AuthError(message, {
    code: authCode,
    cause: error,
    ...(field && { fieldErrors: { [field]: message } }),
  })
}

async function attempt<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action()
  } catch (error) {
    throw firebaseError(error)
  }
}

/**
 * Glyph auth on Firebase Authentication. Pass your initialized `Auth`:
 *
 * ```ts
 * import { getAuth } from 'firebase/auth'
 * const adapter = firebaseAdapter(getAuth(app))
 * ```
 *
 * Firebase verifies email addresses and resets passwords with links it emails, so the
 * screens show "check your inbox" steps instead of code inputs.
 */
export function firebaseAdapter(auth: Auth, options: FirebaseAdapterOptions = {}): AuthAdapter {
  const {
    oauthFlow = 'popup',
    requireEmailVerification = true,
    actionCodeSettings,
    rolesClaim = 'roles',
    permissionsClaim = 'permissions',
    mapUser,
  } = options
  const providers = options.providers ?? defaultProviders()

  async function toSession(user: User | null): Promise<AuthSession | null> {
    if (!user) return null
    if (
      requireEmailVerification &&
      !user.emailVerified &&
      user.providerData.some((p) => p.providerId === 'password')
    )
      return null
    const token = await getIdTokenResult(user)
    const claims = token.claims as Record<string, unknown>
    const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : [])
    return {
      user:
        mapUser?.(user, claims) ??
        ({
          id: user.uid,
          email: user.email ?? '',
          name: user.displayName ?? undefined,
          image: user.photoURL ?? undefined,
          emailVerified: user.emailVerified,
        } as AuthUser),
      expiresAt: Date.parse(token.expirationTime),
      roles: list(claims[rolesClaim]),
      permissions: list(claims[permissionsClaim]),
    }
  }

  return {
    capabilities: {
      signUp: true,
      passwordReset: true,
      passwordResetMethod: 'link',
      emailCode: false,
      magicLink: false,
      twoFactor: false,
      organizations: false,
      oauthProviders: Object.keys(providers),
    },
    async getSession() {
      await auth.authStateReady()
      return toSession(auth.currentUser)
    },
    async signIn(input) {
      if ('provider' in input) {
        const provider = providers[input.provider]
        if (!provider) throw new AuthError(`No Firebase provider configured for ${input.provider}.`)
        if (oauthFlow === 'redirect') {
          await attempt(() => signInWithRedirect(auth, provider))
          return { status: 'redirecting' }
        }
        const { user } = await attempt(() => signInWithPopup(auth, provider))
        return { status: 'signed-in', session: (await toSession(user)) as AuthSession }
      }
      if ('magicLink' in input)
        throw new AuthError('Email links aren’t enabled.', { code: 'not-supported' })
      const { user } = await attempt(() =>
        signInWithEmailAndPassword(auth, input.email, input.password),
      )
      if (requireEmailVerification && !user.emailVerified) {
        await attempt(() => sendEmailVerification(user, actionCodeSettings))
        return { status: 'needs-verification', email: input.email }
      }
      return { status: 'signed-in', session: (await toSession(user)) as AuthSession }
    },
    async signUp({ email, password, name }) {
      const { user } = await attempt(() => createUserWithEmailAndPassword(auth, email, password))
      if (name) await attempt(() => updateProfile(user, { displayName: name }))
      if (requireEmailVerification) {
        await attempt(() => sendEmailVerification(user, actionCodeSettings))
        return { status: 'needs-verification', email }
      }
      return { status: 'signed-in', session: (await toSession(user)) as AuthSession }
    },
    signOut: () => attempt(() => signOut(auth)),
    async refresh() {
      const user = auth.currentUser
      if (!user) return null
      // Reload picks up a verified email; forcing a token picks up new custom claims.
      await attempt(() => user.reload())
      await attempt(() => user.getIdToken(true))
      return toSession(auth.currentUser)
    },
    requestPasswordReset: (email) =>
      attempt(() => sendPasswordResetEmail(auth, email, actionCodeSettings)),
    resetPassword: ({ token, password }) =>
      attempt(() => confirmPasswordReset(auth, token, password)),
    async resendVerification() {
      const user = auth.currentUser
      if (user) await attempt(() => sendEmailVerification(user, actionCodeSettings))
    },
    async updateUser(patch) {
      const user = auth.currentUser
      if (!user) throw new AuthError('Sign in first.', { status: 401 })
      const { name, image } = patch as { name?: string; image?: string }
      await attempt(() =>
        updateProfile(user, {
          ...(name !== undefined && { displayName: name }),
          ...(image !== undefined && { photoURL: image }),
        }),
      )
      return (await toSession(user)) as AuthSession
    },
    async getAuthHeaders(): Promise<Record<string, string>> {
      const token = await auth.currentUser?.getIdToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    subscribe(listener) {
      return onIdTokenChanged(auth, (user) => {
        void toSession(user).then(listener)
      })
    },
  }
}
