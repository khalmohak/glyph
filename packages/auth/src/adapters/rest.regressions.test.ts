import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthError } from '../core/errors'
import { restAdapter } from './rest'

type Reply = { status?: number; json?: unknown; text?: string; headers?: Record<string, string> }
type Route = (body: unknown, init: RequestInit) => Reply | Promise<Reply>

function server(routes: Record<string, Route>) {
  const calls: { key: string; body: unknown; init: RequestInit }[] = []
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    const key = `${init.method} ${url}`
    const body = init.body ? JSON.parse(init.body as string) : undefined
    calls.push({ key, body, init })
    const route = routes[key]
    if (!route) return new Response('not found', { status: 404 })
    const result = await route(body, init)
    const text = result.text ?? (result.json === undefined ? '' : JSON.stringify(result.json))
    return new Response(text || null, {
      status: result.status ?? 200,
      ...(result.headers && { headers: result.headers }),
    })
  })
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls }
}

const user = { id: 'u1', email: 'ada@example.com', name: 'Ada' }

/** A refresh-token family with reuse detection, like most rotation implementations. */
function rotatingServer() {
  let current = 'r1'
  let access = 'a1'
  let revoked = false
  let rotations = 0
  const s = server({
    'POST /auth/refresh': async (body) => {
      await new Promise((resolve) => setTimeout(resolve, 5))
      const token = (body as { refreshToken?: string }).refreshToken
      if (revoked || token !== current) {
        revoked = true // reuse: revoke the whole family
        return { status: 401, json: { message: 'Refresh token reused' } }
      }
      rotations += 1
      current = `r${rotations + 1}`
      access = `a${rotations + 1}`
      return { json: { user, accessToken: access, refreshToken: current } }
    },
    'GET /auth/session': (_body, init) => {
      const header = new Headers(init.headers).get('Authorization')
      return header === `Bearer ${access}` && !revoked ? { json: { user } } : { status: 401 }
    },
  })
  return { ...s, rotations: () => rotations, revoked: () => revoked }
}

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
  // biome-ignore lint/suspicious/noDocumentCookie: tests reset the cookie they set
  document.cookie = 'csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
})

describe('refresh-token rotation races', () => {
  it('rotates once when a session check and a refresh need a new token at the same time', async () => {
    const api = rotatingServer()
    localStorage.setItem(
      'glyph-auth-tokens',
      JSON.stringify({ accessToken: 'old', refreshToken: 'r1' }),
    )
    const adapter = restAdapter({ mode: 'bearer', fetch: api.fetch })
    const [a, b] = await Promise.all([adapter.getSession(), adapter.refresh?.()])
    expect(api.revoked()).toBe(false)
    expect(api.rotations()).toBe(1)
    expect(a?.user).toEqual(user)
    expect(b?.user).toEqual(user)
  })

  it('rotates once when two tabs refresh at the same moment', async () => {
    // A minimal Web Locks API shared by both "tabs" (they share the page's globals here).
    const queues = new Map<string, Promise<unknown>>()
    vi.stubGlobal('navigator', {
      ...navigator,
      locks: {
        request: (name: string, callback: () => Promise<unknown>) => {
          const previous = queues.get(name) ?? Promise.resolve()
          const next = previous.then(callback, callback)
          queues.set(
            name,
            next.catch(() => {}),
          )
          return next
        },
      },
    })
    const api = rotatingServer()
    localStorage.setItem(
      'glyph-auth-tokens',
      JSON.stringify({ accessToken: 'old', refreshToken: 'r1' }),
    )
    const tabA = restAdapter({ mode: 'bearer', fetch: api.fetch })
    const tabB = restAdapter({ mode: 'bearer', fetch: api.fetch })
    const [a, b] = await Promise.all([tabA.refresh?.(), tabB.refresh?.()])
    expect(api.revoked()).toBe(false)
    expect(api.rotations()).toBe(1)
    expect(a?.user).toEqual(user)
    expect(b?.user).toEqual(user)
  })
})

describe('sessions without a user', () => {
  it('treats `200 { user: null }` as signed out', async () => {
    const { fetch } = server({ 'GET /auth/session': () => ({ json: { user: null } }) })
    expect(await restAdapter({ fetch }).getSession()).toBeNull()
  })

  it('loads the user when sign-in answers without one (e.g. 204 + cookie)', async () => {
    const { fetch } = server({
      'POST /auth/sign-in': () => ({ status: 204 }),
      'GET /auth/session': () => ({ json: { user } }),
    })
    const result = await restAdapter({ fetch }).signIn({ email: user.email, password: 'x' })
    expect(result).toMatchObject({ status: 'signed-in', session: { user } })
  })

  it('loads the user when a bearer refresh only returns tokens', async () => {
    const { fetch } = server({
      'POST /auth/refresh': () => ({ json: { accessToken: 'a2', refreshToken: 'r2' } }),
      'GET /auth/session': (_b, init) =>
        new Headers(init.headers).get('Authorization') === 'Bearer a2'
          ? { json: { user } }
          : { status: 401 },
    })
    localStorage.setItem(
      'glyph-auth-tokens',
      JSON.stringify({ accessToken: 'a1', refreshToken: 'r1' }),
    )
    const session = await restAdapter({ mode: 'bearer', fetch }).refresh?.()
    expect(session?.user).toEqual(user)
  })
})

describe('error messages', () => {
  it('does not show an HTML error page to the user', async () => {
    const { fetch } = server({
      'POST /auth/sign-in': () => ({
        status: 502,
        text: '<!doctype html><html><body><h1>502 Bad Gateway</h1></body></html>',
        headers: { 'Content-Type': 'text/html' },
      }),
    })
    const error = await restAdapter({ fetch })
      .signIn({ email: user.email, password: 'x' })
      .catch((e: unknown) => e)
    expect(error).toBeInstanceOf(AuthError)
    expect((error as AuthError).message).not.toMatch(/<|html/i)
    expect((error as AuthError).status).toBe(502)
  })

  it('reads Retry-After on 429s', async () => {
    const { fetch } = server({
      'POST /auth/sign-in': () => ({ status: 429, headers: { 'Retry-After': '30' } }),
    })
    const error = (await restAdapter({ fetch })
      .signIn({ email: user.email, password: 'x' })
      .catch((e: unknown) => e)) as AuthError
    expect(error.code).toBe('rate-limited')
    expect(error.retryAfter).toBe(30)
    expect(error.message).toMatch(/30 seconds/)
  })

  it('uses a sign-in specific message for a bare 401', async () => {
    const { fetch } = server({ 'POST /auth/sign-in': () => ({ status: 401 }) })
    const error = (await restAdapter({ fetch })
      .signIn({ email: user.email, password: 'x' })
      .catch((e: unknown) => e)) as AuthError
    expect(error.code).toBe('invalid-credentials')
    expect(error.message).not.toBe('Something went wrong. Try again.')
  })
})

describe('sign-out', () => {
  it('sends the refresh token so the server can revoke it (bearer)', async () => {
    const { fetch, calls } = server({ 'POST /auth/sign-out': () => ({ status: 204 }) })
    localStorage.setItem(
      'glyph-auth-tokens',
      JSON.stringify({ accessToken: 'a1', refreshToken: 'r1' }),
    )
    await restAdapter({ mode: 'bearer', fetch }).signOut()
    expect(calls[0]?.body).toEqual({ refreshToken: 'r1' })
    expect(localStorage.getItem('glyph-auth-tokens')).toBeNull()
  })

  it('counts a 401 from sign-out as signed out', async () => {
    const { fetch } = server({ 'POST /auth/sign-out': () => ({ status: 401 }) })
    await expect(restAdapter({ fetch }).signOut()).resolves.toBeUndefined()
  })
})

describe('cookie mode', () => {
  it('survives a malformed CSRF cookie', async () => {
    // biome-ignore lint/suspicious/noDocumentCookie: the test sets a broken cookie on purpose
    document.cookie = 'csrf=%E0%A4%A'
    const { fetch } = server({ 'POST /auth/sign-in': () => ({ json: { user } }) })
    const adapter = restAdapter({ fetch, csrf: { header: 'X-CSRF', cookie: 'csrf' } })
    await expect(adapter.signIn({ email: user.email, password: 'x' })).resolves.toMatchObject({
      status: 'signed-in',
    })
  })

  it('checks the session when the server has no refresh endpoint', async () => {
    const { fetch } = server({ 'GET /auth/session': () => ({ json: { user } }) })
    const session = await restAdapter({ fetch }).refresh?.()
    expect(session?.user).toEqual(user)
  })
})
