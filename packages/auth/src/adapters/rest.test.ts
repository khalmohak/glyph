import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthError } from '../core/errors'
import { restAdapter, type TokenStorage } from './rest'

type Route = (
  body: unknown,
  init: RequestInit,
) => { status?: number; json?: unknown; text?: string }

function server(routes: Record<string, Route>) {
  const calls: { url: string; init: RequestInit }[] = []
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    const key = `${init.method} ${url}`
    const route = routes[key]
    if (!route) return new Response('not found', { status: 404 })
    const result = route(init.body ? JSON.parse(init.body as string) : undefined, init)
    const body = result.text ?? (result.json === undefined ? '' : JSON.stringify(result.json))
    return new Response(body || null, { status: result.status ?? 200 })
  })
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls }
}

const user = { id: 'u1', email: 'ada@example.com', name: 'Ada' }

afterEach(() => {
  localStorage.clear()
  // biome-ignore lint/suspicious/noDocumentCookie: tests reset the cookie they set
  document.cookie = 'csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
})

describe('restAdapter (cookie mode)', () => {
  it('sends credentials and maps the session', async () => {
    const { fetch, calls } = server({
      'GET /api/auth/session': () => ({
        json: { user, expiresAt: 123, roles: ['admin'], session: { permissions: ['x:y'] } },
      }),
    })
    const adapter = restAdapter({ baseUrl: '/api', fetch })
    const session = await adapter.getSession()
    expect(session).toMatchObject({ user, expiresAt: 123, roles: ['admin'], permissions: ['x:y'] })
    expect(calls[0]?.init.credentials).toBe('include')
    expect(adapter.credentials).toBe('include')
  })

  it('treats 401 as signed out', async () => {
    const { fetch } = server({ 'GET /auth/session': () => ({ status: 401 }) })
    expect(await restAdapter({ fetch }).getSession()).toBeNull()
  })

  it('maps next steps from 202 responses', async () => {
    const { fetch } = server({
      'POST /auth/sign-in': () => ({ status: 202, json: { status: 'needs-second-factor' } }),
      'POST /auth/sign-up': () => ({ status: 202, json: { status: 'needs-verification' } }),
      'POST /auth/magic-link': () => ({ status: 204 }),
    })
    const adapter = restAdapter({ fetch })
    expect(await adapter.signIn({ email: 'a@b.co', password: 'x' })).toEqual({
      status: 'needs-second-factor',
    })
    expect(await adapter.signUp?.({ email: 'a@b.co', password: 'x' })).toEqual({
      status: 'needs-verification',
      email: 'a@b.co',
    })
    expect(await adapter.signIn({ email: 'a@b.co', magicLink: true })).toEqual({
      status: 'magic-link-sent',
      email: 'a@b.co',
    })
  })

  it('turns error responses into AuthErrors with field errors', async () => {
    const { fetch } = server({
      'POST /auth/sign-up': () => ({
        status: 409,
        json: { message: 'Taken', errors: { email: 'Already registered' } },
      }),
      'POST /auth/sign-in': () => ({ status: 429, text: 'Slow down' }),
    })
    const adapter = restAdapter({ fetch })
    await expect(adapter.signUp?.({ email: 'a@b.co', password: 'x' })).rejects.toMatchObject({
      message: 'Taken',
      code: 'email-taken',
      status: 409,
      fieldErrors: { email: 'Already registered' },
    })
    await expect(adapter.signIn({ email: 'a', password: 'b' })).rejects.toMatchObject({
      message: 'Slow down',
      code: 'rate-limited',
    })
  })

  it('adds a CSRF header from a cookie to writes', async () => {
    // biome-ignore lint/suspicious/noDocumentCookie: simulating the server's CSRF cookie
    document.cookie = 'csrf=tok%20en'
    const { fetch, calls } = server({ 'POST /auth/sign-out': () => ({ status: 204 }) })
    const adapter = restAdapter({ fetch, csrf: { header: 'X-CSRF', cookie: 'csrf' } })
    await adapter.signOut()
    const headers = calls[0]?.init.headers as Record<string, string>
    expect(headers['X-CSRF']).toBe('tok en')
    expect(await adapter.getAuthHeaders?.()).toEqual({ 'X-CSRF': 'tok en' })
  })

  it('calls every endpoint with the right method and body', async () => {
    const seen: string[] = []
    const ok: Route = (body, init) => {
      seen.push(`${init.method} ${JSON.stringify(body)}`)
      return { json: { user } }
    }
    const { fetch } = server({
      'POST /auth/password/forgot': ok,
      'POST /auth/password/reset': ok,
      'POST /auth/verify': ok,
      'POST /auth/verify/resend': ok,
      'POST /auth/two-factor': ok,
      'POST /auth/organization': ok,
      'PATCH /auth/user': ok,
    })
    const adapter = restAdapter({ fetch, headers: () => ({ 'X-App': '1' }) })
    await adapter.requestPasswordReset?.('a@b.co')
    await adapter.resetPassword?.({ token: 't', password: 'p' })
    expect(await adapter.verifyEmail?.({ email: 'a@b.co', code: '123456' })).toMatchObject({
      status: 'signed-in',
    })
    await adapter.resendVerification?.('a@b.co')
    await adapter.verifySecondFactor?.({ code: '1' })
    await adapter.switchOrganization?.('org_1')
    await adapter.updateUser?.({ name: 'Ada' })
    expect(seen).toEqual([
      'POST {"email":"a@b.co"}',
      'POST {"token":"t","password":"p"}',
      'POST {"email":"a@b.co","code":"123456"}',
      'POST {"email":"a@b.co"}',
      'POST {"code":"1"}',
      'POST {"organizationId":"org_1"}',
      'PATCH {"name":"Ada"}',
    ])
  })

  it('sends the browser to the OAuth URL', async () => {
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ assign } as unknown as Location)
    const adapter = restAdapter({ baseUrl: '/api' })
    expect(await adapter.signIn({ provider: 'github' })).toEqual({ status: 'redirecting' })
    expect(assign).toHaveBeenCalledWith('/api/auth/oauth/github')
    vi.restoreAllMocks()
  })
})

describe('restAdapter (bearer mode)', () => {
  it('stores tokens, sends them, and rotates them on refresh', async () => {
    let issued = 0
    const { fetch, calls } = server({
      'POST /auth/sign-in': () => ({ json: { user, accessToken: 'a1', refreshToken: 'r1' } }),
      'GET /auth/session': (_body, init) =>
        (init.headers as Record<string, string>).Authorization === 'Bearer a2'
          ? { json: { user } }
          : { status: 401 },
      'POST /auth/refresh': (body) => {
        issued += 1
        expect(body).toEqual({ refreshToken: 'r1' })
        return { json: { user, accessToken: 'a2', refreshToken: 'r2' } }
      },
    })
    const adapter = restAdapter({ fetch, mode: 'bearer' })
    expect(await adapter.getSession()).toBeNull()
    expect(calls).toHaveLength(0)

    await adapter.signIn({ email: 'a', password: 'b' })
    expect(JSON.parse(localStorage.getItem('glyph-auth-tokens') ?? '')).toEqual({
      accessToken: 'a1',
      refreshToken: 'r1',
    })
    expect(await adapter.getAuthHeaders?.()).toEqual({ Authorization: 'Bearer a1' })

    // The access token is rejected: the adapter refreshes once and retries.
    expect(await adapter.getSession()).toMatchObject({ user })
    expect(issued).toBe(1)
    expect(JSON.parse(localStorage.getItem('glyph-auth-tokens') ?? '').refreshToken).toBe('r2')
    expect(adapter.credentials).toBe('same-origin')
  })

  it('forgets tokens when the refresh token is rejected', async () => {
    const storage: TokenStorage = {
      value: { accessToken: 'a', refreshToken: 'r' },
      get() {
        return this.value
      },
      set(tokens) {
        this.value = tokens
      },
    } as TokenStorage & { value: { accessToken: string; refreshToken?: string } | null }
    const { fetch } = server({
      'GET /auth/session': () => ({ status: 401 }),
      'POST /auth/refresh': () => ({ status: 401 }),
      'POST /auth/sign-out': () => ({ status: 500 }),
    })
    const adapter = restAdapter({ fetch, mode: 'bearer', storage })
    expect(await adapter.getSession()).toBeNull()
    expect(storage.get()).toBeNull()
    expect(await adapter.refresh?.()).toBeNull()
    storage.set({ accessToken: 'a' })
    await expect(adapter.signOut()).rejects.toBeInstanceOf(AuthError)
    expect(storage.get()).toBeNull()
  })

  it('keeps tokens in memory or session storage when asked', async () => {
    const { fetch } = server({
      'POST /auth/sign-in': () => ({ json: { user, accessToken: 'm1' } }),
      'POST /auth/refresh': () => ({ status: 503, json: { message: 'Down' } }),
    })
    const memory = restAdapter({ fetch, mode: 'bearer', storage: 'memory' })
    await memory.signIn({ email: 'a', password: 'b' })
    expect(await memory.getAuthHeaders?.()).toEqual({ Authorization: 'Bearer m1' })
    expect(localStorage.length).toBe(0)
    // No refresh token, so nothing to refresh with.
    expect(await memory.refresh?.()).toBeNull()

    const session = restAdapter({ fetch, mode: 'bearer', storage: 'session', storageKey: 'k' })
    await session.signIn({ email: 'a', password: 'b' })
    expect(sessionStorage.getItem('k')).toContain('m1')
  })
})
