import { afterEach, describe, expect, it, vi } from 'vitest'
import { memoryAdapter } from '../adapters/memory'
import { restAdapter } from '../adapters/rest'
import { createAuthClient } from './client'

// Regressions found by the Relay sample app (bearer mode against a real multi-user server).

type Reply = { status?: number; json?: unknown }
function server(routes: Record<string, (body: Record<string, unknown>) => Reply>) {
  const calls: { key: string; body: Record<string, unknown> }[] = []
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    const key = `${init.method} ${url}`
    const body = init.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {}
    calls.push({ key, body })
    const route = routes[key]
    if (!route) return new Response('not found', { status: 404 })
    const { status = 200, json } = route(body)
    return new Response(json === undefined ? null : JSON.stringify(json), { status })
  })
  return { fetch: fetch as unknown as typeof globalThis.fetch, calls }
}

const user = { id: 'u1', email: 'ada@example.com', name: 'Ada' }

afterEach(() => localStorage.clear())

describe('step challenges (A3)', () => {
  it('sends the 2FA challenge from the sign-in response back with the code', async () => {
    const s = server({
      'POST /auth/sign-in': () => ({
        status: 202,
        json: { status: 'needs-second-factor', challenge: 'ch_123', method: 'email' },
      }),
      'POST /auth/two-factor': (body) =>
        body.challenge === 'ch_123'
          ? { json: { user, accessToken: 'a1', refreshToken: 'r1' } }
          : { status: 422, json: { message: 'Which sign-in is this?' } },
    })
    const client = createAuthClient(restAdapter({ mode: 'bearer', fetch: s.fetch }))
    const first = await client.signIn({ email: 'ada@example.com', password: 'pw' })
    expect(first).toEqual({ status: 'needs-second-factor', challenge: 'ch_123', method: 'email' })
    // The UI doesn't have to pass the challenge: the client remembers it.
    const done = await client.verifySecondFactor({ code: '123456' })
    expect(done.status).toBe('signed-in')
    expect(s.calls.find((c) => c.key === 'POST /auth/two-factor')?.body).toEqual({
      code: '123456',
      challenge: 'ch_123',
    })
  })

  it('sends a verification challenge back with the email code', async () => {
    const s = server({
      'POST /auth/sign-up': () => ({
        status: 202,
        json: { status: 'needs-verification', email: 'ada@example.com', challenge: { id: 'v1' } },
      }),
      'POST /auth/verify': () => ({ json: { user, accessToken: 'a1' } }),
    })
    const client = createAuthClient(restAdapter({ mode: 'bearer', fetch: s.fetch }))
    const first = await client.signUp({ email: 'ada@example.com', password: 'long enough' })
    expect(first).toMatchObject({ status: 'needs-verification', challenge: { id: 'v1' } })
    await client.verifyEmail({ email: 'ada@example.com', code: '111111' })
    expect(s.calls.at(-1)?.body).toEqual({
      email: 'ada@example.com',
      code: '111111',
      challenge: { id: 'v1' },
    })
  })

  it('memory adapter: a code only completes the sign-in it was issued for', async () => {
    const codes: Record<string, string> = {}
    const adapter = memoryAdapter({
      latency: 0,
      users: [
        { email: 'ada@example.com', password: 'pw', twoFactor: true },
        { email: 'grace@example.com', password: 'pw', twoFactor: true },
      ],
      onCode: (c) => {
        codes[c.email] = c.code
      },
    })
    const ada = await adapter.signIn({ email: 'ada@example.com', password: 'pw' })
    const grace = await adapter.signIn({ email: 'grace@example.com', password: 'pw' })
    if (ada.status !== 'needs-second-factor' || grace.status !== 'needs-second-factor')
      throw new Error('expected a second factor')
    expect(ada.challenge).not.toEqual(grace.challenge)
    // Before: a single global "pending" user meant Ada's code finished Grace's sign-in.
    const result = await adapter.verifySecondFactor?.({
      code: codes['ada@example.com'] as string,
      challenge: ada.challenge,
    })
    expect(result?.status === 'signed-in' && result.session.user.email).toBe('ada@example.com')
  })
})

describe('magic links (A4)', () => {
  it('rest: exchanges a link token for a session and stores bearer tokens', async () => {
    const s = server({
      'POST /auth/magic-link/verify': (body) =>
        body.token === 'tok' ? { json: { user, accessToken: 'a1', refreshToken: 'r1' } } : {},
      'GET /auth/session': () => ({ json: { user } }),
    })
    const client = createAuthClient(
      restAdapter({ mode: 'bearer', fetch: s.fetch, capabilities: { magicLink: true } }),
    )
    const result = await client.completeMagicLink('tok')
    expect(result.status).toBe('signed-in')
    expect(client.getState().status).toBe('authenticated')
    expect(JSON.parse(localStorage.getItem('glyph-auth-tokens') ?? '{}')).toMatchObject({
      accessToken: 'a1',
    })
  })

  it('client: rejects when the adapter cannot complete links', async () => {
    const s = server({})
    const adapter = restAdapter({ fetch: s.fetch })
    delete (adapter as { completeMagicLink?: unknown }).completeMagicLink
    const client = createAuthClient(adapter)
    await expect(client.completeMagicLink('x')).rejects.toThrow(/magic/i)
  })
})

describe('sign-up extras (A6)', () => {
  it('rest: sends extra fields in the sign-up body without overriding the core fields', async () => {
    const s = server({ 'POST /auth/sign-up': () => ({ json: { user } }) })
    const client = createAuthClient(restAdapter({ fetch: s.fetch }))
    await client.signUp({
      email: 'ada@example.com',
      password: 'long enough',
      extra: { inviteCode: 'INV-9', email: 'evil@example.com' },
    })
    expect(s.calls[0]?.body).toEqual({
      email: 'ada@example.com',
      password: 'long enough',
      inviteCode: 'INV-9',
    })
  })
})

describe('sign-out reason in state (A9)', () => {
  it('records why the last sign-out happened', async () => {
    const adapter = memoryAdapter({
      latency: 0,
      users: [{ email: 'ada@example.com', password: 'pw' }],
    })
    const client = createAuthClient(adapter, { syncTabs: false })
    await client.signIn({ email: 'ada@example.com', password: 'pw' })
    expect(client.getState().lastSignOut).toBeNull()
    await client.signOut({ reason: 'idle' })
    expect(client.getState().lastSignOut).toMatchObject({ reason: 'idle' })
  })
})
