import { AuthError, type AuthErrorCode } from '../core/errors'
import type {
  AuthAdapter,
  AuthCapabilities,
  AuthSession,
  OAuthProvider,
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
  twoFactor: string
  magicLink: string
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
    if (key === name) return decodeURIComponent(rest.join('='))
  }
  return null
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
 * - A further step: `202 { status: 'needs-verification' | 'needs-second-factor' | 'magic-link-sent', email? }`
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
    }: { method?: string; body?: unknown; token?: string | null } = {},
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
    if (text) {
      try {
        data = JSON.parse(text) as Record<string, unknown>
      } catch {
        data = { message: text }
      }
    }
    if (!response.ok) {
      throw new AuthError(
        typeof data.message === 'string' ? data.message : 'Something went wrong. Try again.',
        {
          code:
            (data.code as AuthErrorCode | undefined) ?? codeByStatus[response.status] ?? 'unknown',
          fieldErrors: data.errors as Record<string, string> | undefined,
          status: response.status,
        },
      )
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

  function toResult(status: number, data: Record<string, unknown>, email?: string): SignInResult {
    if (status === 202 || typeof data.status === 'string') {
      const step = data.status as SignInResult['status']
      const stepEmail = (data.email as string | undefined) ?? email ?? ''
      if (step === 'needs-verification') return { status: step, email: stepEmail }
      if (step === 'magic-link-sent') return { status: step, email: stepEmail }
      if (step === 'needs-second-factor') return { status: step }
    }
    saveTokens(data)
    return { status: 'signed-in', session: mapSession(data) }
  }

  async function refresh(): Promise<AuthSession | null> {
    const refreshToken = storage?.get()?.refreshToken
    if (storage && !refreshToken) return null
    try {
      const { data } = await request(endpoints.refresh, {
        token: null,
        ...(refreshToken && { body: { refreshToken } }),
      })
      saveTokens(data)
      return mapSession(data)
    } catch (error) {
      if (error instanceof AuthError && (error.status === 401 || error.status === 403)) {
        storage?.set(null)
        return null
      }
      throw error
    }
  }

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
      try {
        const { data } = await request(endpoints.session, { method: 'GET' })
        return mapSession(data)
      } catch (error) {
        if (error instanceof AuthError && error.status === 401) {
          // An expired access token: try the refresh token once before giving up.
          return storage ? await refresh() : null
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
      const { status, data } = await request(endpoints.signIn, { body: input })
      return toResult(status, data, input.email)
    },
    async signUp(input) {
      const { status, data } = await request(endpoints.signUp, { body: input })
      return toResult(status, data, input.email)
    },
    async signOut() {
      try {
        await request(endpoints.signOut)
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
