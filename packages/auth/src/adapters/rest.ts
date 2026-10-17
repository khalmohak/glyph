import { AuthError, type AuthErrorCode } from '../core/errors'
import type {
  AuthAdapter,
  AuthCapabilities,
  AuthChallenge,
  AuthSession,
  OAuthProvider,
  SecondFactorMethod,
  SignInInput,
  SignInResult,
} from '../core/types'

export interface RestEndpoints {
  /** GET. 200 with the session, or 401 when signed out. */
  session: string
  signIn: string
  signUp: string
  signOut: string
  refresh: string
  forgotPassword: string
  resetPassword: string
  verify: string
  resendVerification: string
  /** POST `{ code, challenge? }`. */
  twoFactor: string
  /** POST `{ email }`: emails a sign-in link. */
  magicLink: string
  /** POST `{ token }` from the link: answers like sign-in (session, or tokens in bearer mode). */
  magicLinkVerify: string
  /** POST `{ organizationId }`. */
  organization: string
  /** PATCH with the changed user fields. */
  user: string
}

export const defaultEndpoints: RestEndpoints = {
  session: '/auth/session',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  signOut: '/auth/sign-out',
  refresh: '/auth/refresh',
  forgotPassword: '/auth/password/forgot',
  resetPassword: '/auth/password/reset',
  verify: '/auth/verify',
  resendVerification: '/auth/verify/resend',
  twoFactor: '/auth/two-factor',
  magicLink: '/auth/magic-link',
  magicLinkVerify: '/auth/magic-link/verify',
  organization: '/auth/organization',
  user: '/auth/user',
}

export interface Tokens {
  accessToken: string
  refreshToken?: string | undefined
}

/** Where bearer tokens live. `local` survives restarts and syncs tabs; `memory` is safest from XSS. */
export interface TokenStorage {
  get(): Tokens | null
  set(tokens: Tokens | null): void
}

export interface RestAdapterOptions {
  /** Prefix for every endpoint, e.g. `https://api.acme.com` or `/api`. */
  baseUrl?: string
  endpoints?: Partial<RestEndpoints>
  /**
   * `cookie` (default): the server sets an httpOnly session cookie; nothing is stored in JS.
   * `bearer`: the server returns `accessToken` (and `refreshToken`), sent as
   * `Authorization: Bearer …`.
   */
  mode?: 'cookie' | 'bearer'
  /** Bearer mode only. Default `local`. */
  storage?: 'local' | 'session' | 'memory' | TokenStorage
  storageKey?: string
  /** Adds a CSRF header to every non-GET request, read from a cookie or a function. */
  csrf?: { header: string; cookie?: string; token?: () => string | null | undefined }
  /** Extra headers on every request. */
  headers?: Record<string, string> | (() => Record<string, string>)
  /** Which flows your server implements. Defaults: everything except organizations and OAuth. */
  capabilities?: Partial<AuthCapabilities>
  /** Where OAuth buttons send the browser. Default `${baseUrl}/auth/oauth/${provider}`. */
  oauthUrl?: (provider: OAuthProvider) => string
  /** Turns your server's session JSON into a Glyph session. */
  mapSession?: (data: Record<string, unknown>) => AuthSession
  fetch?: typeof fetch
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  for (const part of document.cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key !== name) continue
    const value = rest.join('=')
    try {
      return decodeURIComponent(value)
    } catch {
      // A malformed value must not break every request; send it as is.
      return value
    }
  }
  return null
}

/** Seconds from a `Retry-After` header (delta-seconds or an HTTP date). */
function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds))
  const date = Date.parse(value)
  return Number.isNaN(date) ? undefined : Math.max(0, Math.ceil((date - Date.now()) / 1000))
}

/** A message people can act on, for error responses without a usable `message`. */
function statusMessage(status: number, context: 'sign-in' | 'other', retryAfter?: number): string {
  if (status === 429)
    return retryAfter
      ? `Too many attempts. Try again in ${retryAfter} ${retryAfter === 1 ? 'second' : 'seconds'}.`
      : 'Too many attempts. Wait a moment and try again.'
  if (status === 401)
    return context === 'sign-in'
      ? 'That email and password don’t match.'
      : 'Your session has ended. Sign in again.'
  if (status === 403) return 'You don’t have permission to do that.'
  if (status >= 500) return 'The server had a problem. Try again in a moment.'
  return 'Something went wrong. Try again.'
}

/** Text bodies are shown only when they look like a short, human message. */
function plainMessage(text: string, contentType: string | null): string | undefined {
  if (contentType && !/^text\/plain/i.test(contentType)) return undefined
  const trimmed = text.trim()
  if (!trimmed || trimmed.length > 200 || /<[a-z!/]/i.test(trimmed)) return undefined
  return trimmed
}

// Refreshes queue per lock name in this tab when the Web Locks API is unavailable.
const localLocks = new Map<string, Promise<unknown>>()

/**
 * Runs `task` while holding a lock shared by every tab on this origin (Web Locks API), or
 * by this tab only where browsers lack it. Two rotations of the same refresh token look like
 * token theft to servers with reuse detection, which then sign the user out everywhere.
 */
function withLock<T>(name: string, task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks
  if (locks?.request) return locks.request(name, task) as Promise<T>
  const previous = localLocks.get(name) ?? Promise.resolve()
  const next = previous.then(task, task)
  localLocks.set(
    name,
    next.catch(() => {}),
  )
  return next
}

function webStorage(kind: 'local' | 'session', key: string): TokenStorage {
  const store = () => {
    try {
      return kind === 'local' ? window.localStorage : window.sessionStorage
    } catch {
      return null
    }
  }
  return {
    get() {
      const raw = store()?.getItem(key)
      if (!raw) return null
      try {
        return JSON.parse(raw) as Tokens
      } catch {
        return null
      }
    },
    set(tokens) {
      if (tokens) store()?.setItem(key, JSON.stringify(tokens))
      else store()?.removeItem(key)
    },
  }
}

function memoryStorage(): TokenStorage {
  let tokens: Tokens | null = null
  return {
    get: () => tokens,
    set: (next) => {
      tokens = next
    },
  }
}

function defaultMapSession(data: Record<string, unknown>): AuthSession {
  const session = (data.session as Record<string, unknown> | undefined) ?? {}
  return {
    user: data.user as AuthSession['user'],
    expiresAt: (data.expiresAt ?? session.expiresAt) as number | undefined,
    roles: (data.roles ?? session.roles) as string[] | undefined,
    permissions: (data.permissions ?? session.permissions) as string[] | undefined,
    organizations: (data.organizations ?? session.organizations) as
      | AuthSession['organizations']
      | undefined,
    activeOrganizationId: (data.activeOrganizationId ?? session.activeOrganizationId) as
      | string
      | undefined,
  }
}

const codeByStatus: Record<number, AuthErrorCode> = {
  401: 'invalid-credentials',
  409: 'email-taken',
  410: 'expired-token',
  429: 'rate-limited',
}

/**
 * Connects Glyph to your own auth API. The server contract:
 *
 * - Success: `200 { user, expiresAt?, roles?, permissions?, organizations?, accessToken?, refreshToken? }`
 * - A further step: `202 { status: 'needs-verification' | 'needs-second-factor' | 'magic-link-sent', email?, challenge?, method? }`.
 *   `challenge` (any JSON) comes back in the code request, so the server knows which sign-in
 *   it completes without a cookie; `method` (`totp` | `email` | `sms`) words the code step.
 * - Errors: `4xx { message?, code?, errors?: { email?: string, password?: string, ... } }`
 * - `GET session` returns 401 when signed out.
 */
export function restAdapter(options: RestAdapterOptions = {}): AuthAdapter {
  const {
    baseUrl = '',
    mode = 'cookie',
    storageKey = 'glyph-auth-tokens',
    csrf,
    headers,
    mapSession = defaultMapSession,
  } = options
  const endpoints = { ...defaultEndpoints, ...options.endpoints }
  const doFetch = (input: string, init: RequestInit) => (options.fetch ?? fetch)(input, init)
  const storage: TokenStorage | null =
    mode !== 'bearer'
      ? null
      : typeof options.storage === 'object'
        ? options.storage
        : options.storage === 'memory'
          ? memoryStorage()
          : webStorage(options.storage ?? 'local', storageKey)
  const oauthUrl =
    options.oauthUrl ??
    ((provider: OAuthProvider) => `${baseUrl}/auth/oauth/${encodeURIComponent(provider)}`)

  async function request(
    path: string,
    {
      method = 'POST',
      body,
      token,
      context = 'other',
    }: {
      method?: string
      body?: unknown
      token?: string | null
      context?: 'sign-in' | 'other'
    } = {},
  ): Promise<{ status: number; data: Record<string, unknown> }> {
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...(typeof headers === 'function' ? headers() : headers),
    }
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
    const bearer = token === undefined ? storage?.get()?.accessToken : token
    if (bearer) requestHeaders.Authorization = `Bearer ${bearer}`
    if (csrf && method !== 'GET') {
      const value = csrf.token?.() ?? (csrf.cookie ? readCookie(csrf.cookie) : null)
      if (value) requestHeaders[csrf.header] = value
    }
    const response = await doFetch(`${baseUrl}${path}`, {
      method,
      headers: requestHeaders,
      ...(mode === 'cookie' && { credentials: 'include' as const }),
      ...(body !== undefined && { body: JSON.stringify(body) }),
    })
    const text = await response.text()
    let data: Record<string, unknown> = {}
    let json = false
    if (text) {
      try {
        const parsed: unknown = JSON.parse(text)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          data = parsed as Record<string, unknown>
          json = true
        }
      } catch {}
    }
    if (!response.ok) {
      const retryAfter =
        response.status === 429 ? parseRetryAfter(response.headers.get('Retry-After')) : undefined
      const serverMessage =
        typeof data.message === 'string'
          ? data.message
          : json
            ? undefined
            : plainMessage(text, response.headers.get('Content-Type'))
      const fieldErrors =
        data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)
          ? (data.errors as Record<string, string>)
          : undefined
      throw new AuthError(serverMessage ?? statusMessage(response.status, context, retryAfter), {
        code:
          (data.code as AuthErrorCode | undefined) ?? codeByStatus[response.status] ?? 'unknown',
        fieldErrors,
        status: response.status,
        retryAfter,
      })
    }
    return { status: response.status, data }
  }

  function saveTokens(data: Record<string, unknown>) {
    if (!storage || typeof data.accessToken !== 'string') return
    const previous = storage.get()
    storage.set({
      accessToken: data.accessToken,
      // Rotation: keep the old refresh token only if the server didn't send a new one.
      refreshToken: (data.refreshToken as string | undefined) ?? previous?.refreshToken,
    })
  }

  /** A session only counts when it has a user: `200 { user: null }` means signed out. */
  function toSession(data: Record<string, unknown>): AuthSession | null {
    const session = mapSession(data)
    return session?.user ? session : null
  }

  /** `GET session` without the refresh fallback. */
  async function fetchSession(): Promise<AuthSession | null> {
    try {
      const { data } = await request(endpoints.session, { method: 'GET' })
      return toSession(data)
    } catch (error) {
      if (error instanceof AuthError && error.status === 401) return null
      throw error
    }
  }

  async function toResult(
    status: number,
    data: Record<string, unknown>,
    email?: string,
  ): Promise<SignInResult> {
    if (status === 202 || typeof data.status === 'string') {
      const step = data.status as SignInResult['status']
      const stepEmail = (data.email as string | undefined) ?? email ?? ''
      const challenge = data.challenge as AuthChallenge | undefined
      const withChallenge = challenge === undefined || challenge === null ? {} : { challenge }
      if (step === 'needs-verification') return { status: step, email: stepEmail, ...withChallenge }
      if (step === 'magic-link-sent') return { status: step, email: stepEmail }
      if (step === 'needs-second-factor')
        return {
          status: step,
          ...withChallenge,
          ...(typeof data.method === 'string' && { method: data.method as SecondFactorMethod }),
          ...(typeof data.email === 'string' && { email: data.email }),
        }
    }
    saveTokens(data)
    // Servers that answer `204` and set a cookie: read the user from the session endpoint.
    const session = toSession(data) ?? (await fetchSession())
    if (!session)
      throw new AuthError(
        'You’re signed in, but the server didn’t return your account. Try again.',
        { status },
      )
    return { status: 'signed-in', session }
  }

  // Changes whenever a refresh rotates the session, in this tab or (via storage) another.
  const rotationKey = `${storageKey}:rotation`
  let rotations = 0
  function rotationMarker(): string {
    let shared = ''
    try {
      shared = localStorage.getItem(rotationKey) ?? ''
    } catch {}
    return `${storage?.get()?.refreshToken ?? ''}|${shared}|${rotations}`
  }
  function markRotated() {
    rotations += 1
    try {
      localStorage.setItem(rotationKey, `${Date.now()}-${Math.random()}`)
    } catch {}
  }

  /**
   * Refreshes at most once at a time across tabs. `since` is the rotation marker from when
   * the failing request went out: if the session rotated after that, the new tokens are used
   * instead of rotating again.
   */
  function refreshFrom(since: string): Promise<AuthSession | null> {
    return withLock(`${storageKey}:refresh`, async () => {
      if (rotationMarker() !== since) {
        const current = await fetchSession()
        if (current) return current
      }
      const refreshToken = storage?.get()?.refreshToken
      if (storage && !refreshToken) return null
      try {
        const { data } = await request(endpoints.refresh, {
          token: null,
          ...(refreshToken && { body: { refreshToken } }),
        })
        saveTokens(data)
        markRotated()
        // Some servers answer a refresh with tokens only.
        return toSession(data) ?? (await fetchSession())
      } catch (error) {
        if (error instanceof AuthError) {
          if (error.status === 401 || error.status === 403) {
            storage?.set(null)
            return null
          }
          // Cookie servers without a refresh endpoint: checking the session is the refresh.
          if (!storage && (error.status === 404 || error.status === 405)) return fetchSession()
        }
        throw error
      }
    })
  }

  const refresh = () => refreshFrom(rotationMarker())

  return {
    capabilities: {
      signUp: true,
      passwordReset: true,
      emailCode: true,
      magicLink: false,
      twoFactor: false,
      organizations: false,
      oauthProviders: [],
      ...options.capabilities,
    },
    credentials: mode === 'cookie' ? 'include' : 'same-origin',
    async getSession() {
      if (storage && !storage.get()) return null
      const since = rotationMarker()
      try {
        const { data } = await request(endpoints.session, { method: 'GET' })
        return toSession(data)
      } catch (error) {
        if (error instanceof AuthError && error.status === 401) {
          // An expired access token: try the refresh token once before giving up.
          return storage ? await refreshFrom(since) : null
        }
        throw error
      }
    },
    async signIn(input: SignInInput) {
      if ('provider' in input) {
        window.location.assign(oauthUrl(input.provider))
        return { status: 'redirecting' }
      }
      if ('magicLink' in input) {
        const { status, data } = await request(endpoints.magicLink, {
          body: { email: input.email },
        })
        return status === 202 || data.status
          ? toResult(status, data, input.email)
          : { status: 'magic-link-sent', email: input.email }
      }
      const { status, data } = await request(endpoints.signIn, {
        body: input,
        context: 'sign-in',
      })
      return toResult(status, data, input.email)
    },
    async signUp({ extra, ...input }) {
      // Extra fields travel next to the core ones, which they can't override.
      const { status, data } = await request(endpoints.signUp, { body: { ...extra, ...input } })
      return toResult(status, data, input.email)
    },
    async signOut() {
      // Send the refresh token so the server can revoke it, not just the access token.
      const refreshToken = storage?.get()?.refreshToken
      try {
        await request(endpoints.signOut, refreshToken ? { body: { refreshToken } } : {})
      } catch (error) {
        // 401/403: the server already considers this session gone.
        if (!(error instanceof AuthError && (error.status === 401 || error.status === 403)))
          throw error
      } finally {
        storage?.set(null)
      }
    },
    refresh,
    async requestPasswordReset(email) {
      await request(endpoints.forgotPassword, { body: { email } })
    },
    async resetPassword(input) {
      await request(endpoints.resetPassword, { body: input })
    },
    async verifyEmail(input) {
      const { status, data } = await request(endpoints.verify, { body: input })
      return toResult(status, data, input.email)
    },
    async resendVerification(email) {
      await request(endpoints.resendVerification, { body: { email } })
    },
    async verifySecondFactor(input) {
      const { status, data } = await request(endpoints.twoFactor, { body: input })
      return toResult(status, data)
    },
    async completeMagicLink(token) {
      const { status, data } = await request(endpoints.magicLinkVerify, {
        body: { token },
        context: 'sign-in',
      })
      return toResult(status, data)
    },
    async switchOrganization(organizationId) {
      const { data } = await request(endpoints.organization, { body: { organizationId } })
      return mapSession(data)
    },
    async updateUser(patch) {
      const { data } = await request(endpoints.user, { method: 'PATCH', body: patch })
      return mapSession(data)
    },
    getAuthHeaders() {
      const token = storage?.get()?.accessToken
      const result: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
      if (csrf) {
        const value = csrf.token?.() ?? (csrf.cookie ? readCookie(csrf.cookie) : null)
        if (value) result[csrf.header] = value
      }
      return result
    },
  }
}
