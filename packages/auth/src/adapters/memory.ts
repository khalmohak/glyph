import { AuthError } from '../core/errors'
import type {
  AuthAdapter,
  AuthSession,
  AuthUser,
  OAuthProvider,
  Organization,
  SignInResult,
} from '../core/types'

export interface MemoryUser {
  id?: string
  email: string
  password: string
  name?: string
  image?: string
  emailVerified?: boolean
  roles?: string[]
  permissions?: string[]
  organizations?: Organization[]
  /** Ask for a one-time code after the password. */
  twoFactor?: boolean
}

export type MemoryCodeKind = 'verify-email' | 'reset-password' | 'magic-link' | 'two-factor'

export interface MemoryCode {
  kind: MemoryCodeKind
  email: string
  /** The code to type, or the token for links. */
  code: string
}

export type MemoryOperation =
  | 'getSession'
  | 'signIn'
  | 'signUp'
  | 'signOut'
  | 'refresh'
  | 'requestPasswordReset'
  | 'resetPassword'
  | 'verifyEmail'
  | 'verifySecondFactor'

export interface MemoryAdapterOptions {
  users?: MemoryUser[]
  /** Simulated network delay in ms, fixed or a `[min, max]` range. Default `[200, 500]`. */
  latency?: number | readonly [number, number]
  /** New accounts must confirm their email with a code. Default true. */
  requireEmailVerification?: boolean
  /** Session lifetime in ms. Default 1 hour. */
  sessionDuration?: number
  oauthProviders?: OAuthProvider[]
  /**
   * Keep users and the session in web storage so they survive reloads and are shared
   * between tabs. Default false (memory only).
   */
  persist?: 'local' | 'session' | false
  storageKey?: string
  /** Where codes and links are "emailed". Default `console.info`. */
  onCode?: (code: MemoryCode) => void
  /** Return an error to make an operation fail, e.g. to demo error states. */
  fail?: (operation: MemoryOperation) => AuthError | undefined
}

export interface MemoryAdapter extends AuthAdapter {
  /** The latest code or token sent to `email` (for tests and demo banners). */
  lastCode(email: string, kind?: MemoryCodeKind): string | undefined
  /** Invalidates the current session server-side, as if it expired. */
  expireSession(): void
  /** Completes a magic link, as if the user clicked it. */
  completeMagicLink(token: string): Promise<SignInResult>
}

type StoredUser = MemoryUser & { id: string }

interface Store {
  users: StoredUser[]
  session: { userId: string; expiresAt: number; organizationId?: string; revoked?: boolean } | null
  codes: (MemoryCode & { expiresAt: number })[]
  /** Sign-ins waiting for their second factor, by challenge id. */
  challenges?: { id: string; userId: string; expiresAt: number }[]
  /** Older persisted stores only. */
  pendingSecondFactor?: string | null
}

const CODE_TTL = 15 * 60_000

function randomCode(length = 6): string {
  let code = ''
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10)
  return code
}

function randomToken(): string {
  return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join('')
}

/**
 * A complete auth backend in the browser, for demos, prototypes and tests. Passwords are
 * stored in plain text: never use it in production.
 */
export function memoryAdapter(options: MemoryAdapterOptions = {}): MemoryAdapter {
  const {
    latency = [200, 500],
    requireEmailVerification = true,
    sessionDuration = 60 * 60_000,
    oauthProviders = ['google', 'github'],
    persist = false,
    storageKey = 'glyph-auth-memory',
    onCode = (code: MemoryCode) =>
      console.info(`[glyph auth] ${code.kind} for ${code.email}: ${code.code}`),
    fail,
  } = options

  const seed = (): Store => ({
    users: (options.users ?? []).map((user, i) => ({
      emailVerified: true,
      ...user,
      id: user.id ?? `user_${i + 1}`,
      email: user.email.toLowerCase(),
    })),
    session: null,
    codes: [],
    challenges: [],
  })

  const webStore = () => {
    if (!persist || typeof window === 'undefined') return null
    try {
      return persist === 'local' ? window.localStorage : window.sessionStorage
    } catch {
      return null
    }
  }

  let memory: Store = seed()
  function read(): Store {
    const raw = webStore()?.getItem(storageKey)
    if (!raw) return memory
    try {
      return JSON.parse(raw) as Store
    } catch {
      return memory
    }
  }
  function write(store: Store) {
    memory = store
    webStore()?.setItem(storageKey, JSON.stringify(store))
  }
  if (webStore() && !webStore()?.getItem(storageKey)) write(memory)

  async function delay(operation: MemoryOperation) {
    const ms =
      typeof latency === 'number' ? latency : latency[0] + Math.random() * (latency[1] - latency[0])
    if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms))
    const error = fail?.(operation)
    if (error) throw error
  }

  function sendCode(store: Store, kind: MemoryCodeKind, email: string): string {
    const code = kind === 'reset-password' || kind === 'magic-link' ? randomToken() : randomCode()
    store.codes = store.codes.filter((c) => !(c.kind === kind && c.email === email))
    store.codes.push({ kind, email, code, expiresAt: Date.now() + CODE_TTL })
    onCode({ kind, email, code })
    return code
  }

  function takeCode(store: Store, kind: MemoryCodeKind, match: (c: MemoryCode) => boolean) {
    const found = store.codes.find((c) => c.kind === kind && match(c) && c.expiresAt > Date.now())
    if (found) store.codes = store.codes.filter((c) => c !== found)
    return found
  }

  function sessionFor(store: Store): AuthSession | null {
    const current = store.session
    if (!current || current.revoked || current.expiresAt <= Date.now()) return null
    const user = store.users.find((u) => u.id === current.userId)
    if (!user) return null
    const {
      password: _password,
      twoFactor: _twoFactor,
      roles,
      permissions,
      organizations,
      ...profile
    } = user
    return {
      user: profile as unknown as AuthUser,
      expiresAt: current.expiresAt,
      roles: roles ?? [],
      permissions: permissions ?? [],
      ...(organizations?.length && {
        organizations,
        activeOrganizationId: current.organizationId ?? organizations[0]?.id,
      }),
    }
  }

  function startSession(store: Store, userId: string): SignInResult {
    const user = store.users.find((u) => u.id === userId)
    store.session = {
      userId,
      expiresAt: Date.now() + sessionDuration,
      ...(user?.organizations?.[0] && { organizationId: user.organizations[0].id }),
    }
    store.challenges = (store.challenges ?? []).filter((c) => c.userId !== userId)
    write(store)
    return { status: 'signed-in', session: sessionFor(store) as AuthSession }
  }

  const adapter: MemoryAdapter = {
    capabilities: {
      signUp: true,
      passwordReset: true,
      passwordResetMethod: 'link',
      emailCode: true,
      magicLink: true,
      twoFactor: true,
      organizations: true,
      oauthProviders,
    },
    async getSession() {
      await delay('getSession')
      return sessionFor(read())
    },
    async signIn(input) {
      await delay('signIn')
      const store = read()
      if ('provider' in input) {
        const email = `${input.provider}.user@example.com`
        let user = store.users.find((u) => u.email === email)
        if (!user) {
          user = {
            id: `user_${input.provider}`,
            email,
            password: randomToken(),
            name: `${input.provider[0]?.toUpperCase()}${input.provider.slice(1)} User`,
            emailVerified: true,
          }
          store.users.push(user)
        }
        return startSession(store, user.id as string)
      }
      const email = input.email.trim().toLowerCase()
      const user = store.users.find((u) => u.email === email)
      if ('magicLink' in input) {
        // Same answer whether or not the account exists, so emails can't be probed.
        if (user) sendCode(store, 'magic-link', email)
        write(store)
        return { status: 'magic-link-sent', email }
      }
      if (!user || user.password !== input.password)
        throw new AuthError('That email and password don’t match.', {
          code: 'invalid-credentials',
          status: 401,
        })
      if (!user.emailVerified) {
        sendCode(store, 'verify-email', email)
        write(store)
        return { status: 'needs-verification', email }
      }
      if (user.twoFactor) {
        const challenge = `ch_${randomToken().slice(0, 12)}`
        store.challenges = [
          ...(store.challenges ?? []).filter((c) => c.expiresAt > Date.now()),
          { id: challenge, userId: user.id as string, expiresAt: Date.now() + CODE_TTL },
        ]
        sendCode(store, 'two-factor', email)
        write(store)
        return { status: 'needs-second-factor', challenge, method: 'email', email }
      }
      return startSession(store, user.id as string)
    },
    async signUp(input) {
      await delay('signUp')
      const store = read()
      const email = input.email.trim().toLowerCase()
      if (store.users.some((u) => u.email === email))
        throw new AuthError('An account with this email already exists.', {
          code: 'email-taken',
          fieldErrors: { email: 'An account with this email already exists. Sign in instead.' },
          status: 409,
        })
      const user = {
        id: `user_${store.users.length + 1}_${randomToken().slice(0, 6)}`,
        email,
        password: input.password,
        ...(input.name && { name: input.name }),
        emailVerified: !requireEmailVerification,
        roles: ['member'],
        permissions: [],
      }
      store.users.push(user)
      if (requireEmailVerification) {
        sendCode(store, 'verify-email', email)
        write(store)
        return { status: 'needs-verification', email }
      }
      return startSession(store, user.id)
    },
    async signOut() {
      await delay('signOut')
      const store = read()
      store.session = null
      write(store)
    },
    async refresh() {
      await delay('refresh')
      const store = read()
      const session = sessionFor(store)
      if (!session || !store.session) return null
      store.session.expiresAt = Date.now() + sessionDuration
      write(store)
      return sessionFor(store)
    },
    async requestPasswordReset(email) {
      await delay('requestPasswordReset')
      const store = read()
      const normalized = email.trim().toLowerCase()
      if (store.users.some((u) => u.email === normalized))
        sendCode(store, 'reset-password', normalized)
      write(store)
    },
    async resetPassword({ token, password, email }) {
      await delay('resetPassword')
      const store = read()
      const normalized = email?.trim().toLowerCase()
      const found = takeCode(
        store,
        'reset-password',
        (c) => c.code === token && (normalized === undefined || c.email === normalized),
      )
      if (!found)
        throw new AuthError('This reset link has expired. Request a new one.', {
          code: 'expired-token',
          status: 410,
        })
      const user = store.users.find((u) => u.email === found.email)
      if (user) user.password = password
      write(store)
    },
    async verifyEmail({ email, code }) {
      await delay('verifyEmail')
      const store = read()
      const normalized = email.trim().toLowerCase()
      const found = takeCode(
        store,
        'verify-email',
        (c) => c.email === normalized && c.code === code,
      )
      if (!found)
        throw new AuthError('That code isn’t right. Check the email and try again.', {
          code: 'invalid-code',
          fieldErrors: { code: 'That code isn’t right. Check the email and try again.' },
        })
      const user = store.users.find((u) => u.email === normalized)
      if (!user) throw new AuthError('Account not found.')
      user.emailVerified = true
      return startSession(store, user.id as string)
    },
    async resendVerification(email) {
      const store = read()
      sendCode(store, 'verify-email', email.trim().toLowerCase())
      write(store)
    },
    async verifySecondFactor({ code, challenge }) {
      await delay('verifySecondFactor')
      const store = read()
      const live = (store.challenges ?? []).filter((c) => c.expiresAt > Date.now())
      // Each sign-in has its own challenge; a code can only finish the sign-in it belongs to.
      const pending =
        typeof challenge === 'string' ? live.find((c) => c.id === challenge) : live.at(-1)
      const user = store.users.find((u) => u.id === pending?.userId)
      if (!user)
        throw new AuthError('Sign in again to continue.', { code: 'session-expired', status: 401 })
      const found = takeCode(store, 'two-factor', (c) => c.email === user.email && c.code === code)
      if (!found)
        throw new AuthError('That code isn’t right.', {
          code: 'invalid-code',
          fieldErrors: { code: 'That code isn’t right. Try the newest code.' },
        })
      return startSession(store, user.id as string)
    },
    async switchOrganization(organizationId) {
      const store = read()
      if (!store.session) throw new AuthError('Sign in first.', { status: 401 })
      store.session.organizationId = organizationId
      write(store)
      return sessionFor(store) as AuthSession
    },
    async updateUser(patch) {
      const store = read()
      const user = store.users.find((u) => u.id === store.session?.userId)
      if (!user) throw new AuthError('Sign in first.', { status: 401 })
      Object.assign(user, patch)
      write(store)
      return sessionFor(store) as AuthSession
    },
    lastCode(email, kind) {
      const normalized = email.trim().toLowerCase()
      const codes = read().codes.filter(
        (c) => c.email === normalized && (kind === undefined || c.kind === kind),
      )
      return codes.at(-1)?.code
    },
    expireSession() {
      const store = read()
      if (store.session) store.session.revoked = true
      write(store)
    },
    async completeMagicLink(token) {
      const store = read()
      const found = takeCode(store, 'magic-link', (c) => c.code === token)
      if (!found)
        throw new AuthError('This sign-in link has expired. Request a new one.', {
          code: 'expired-token',
          status: 410,
        })
      const user = store.users.find((u) => u.email === found.email)
      if (!user) throw new AuthError('Account not found.')
      return startSession(store, user.id as string)
    },
  }
  return adapter
}
