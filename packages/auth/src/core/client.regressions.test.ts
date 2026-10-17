import { afterEach, describe, expect, it, vi } from 'vitest'
import { memoryAdapter } from '../adapters/memory'
import { ada } from '../test/render'
import { createAuthClient } from './client'
import type { AuthAdapter, AuthSession } from './types'

const session: AuthSession = { user: { id: 'u1', email: 'a@b.co' } }

function fakeAdapter(overrides: Partial<AuthAdapter> = {}): AuthAdapter {
  return {
    capabilities: {
      signUp: false,
      passwordReset: false,
      emailCode: false,
      magicLink: false,
      twoFactor: false,
      organizations: true,
      oauthProviders: [],
    },
    getSession: vi.fn(async () => session),
    signIn: vi.fn(async () => ({ status: 'signed-in' as const, session })),
    signOut: vi.fn(async () => {}),
    ...overrides,
  }
}

const quiet = { refreshInterval: false, refreshOnFocus: false, syncTabs: false } as const

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  localStorage.clear()
  sessionStorage.clear()
})

describe('fetch replays Request objects', () => {
  it('keeps the request’s own headers, method and body, including on the retry', async () => {
    const seen: { method: string; header: string | null; body: string }[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init)
      seen.push({
        method: request.method,
        header: request.headers.get('X-Trace'),
        body: await request.text(),
      })
      return new Response('', { status: seen.length === 1 ? 401 : 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const client = createAuthClient(fakeAdapter({ refresh: async () => session }), quiet)
    await client.ready()
    const response = await client.fetch(
      new Request('http://localhost/api/invoices', {
        method: 'POST',
        headers: { 'X-Trace': 'abc' },
        body: 'payload',
      }),
    )
    expect(response.status).toBe(200)
    expect(seen).toEqual([
      { method: 'POST', header: 'abc', body: 'payload' },
      { method: 'POST', header: 'abc', body: 'payload' },
    ])
  })
})

describe('expiry refresh', () => {
  it('does not hammer the server when sessions are short-lived', async () => {
    vi.useFakeTimers()
    // Every refresh hands back a 20-second session: shorter than the 30-second margin.
    const refresh = vi.fn(async () => ({ ...session, expiresAt: Date.now() + 20_000 }))
    const client = createAuthClient(
      fakeAdapter({
        getSession: async () => ({ ...session, expiresAt: Date.now() + 20_000 }),
        refresh,
      }),
      quiet,
    )
    const stop = client.start()
    await vi.advanceTimersByTimeAsync(60_000)
    // About one refresh per half-lifetime, not one per tick.
    expect(refresh.mock.calls.length).toBeGreaterThan(0)
    expect(refresh.mock.calls.length).toBeLessThanOrEqual(8)
    stop()
  })

  it('backs off when the server clock makes every session look expired', async () => {
    vi.useFakeTimers()
    const refresh = vi.fn(async () => ({ ...session, expiresAt: Date.now() - 60_000 }))
    const client = createAuthClient(
      fakeAdapter({
        getSession: async () => ({ ...session, expiresAt: Date.now() - 60_000 }),
        refresh,
      }),
      quiet,
    )
    const stop = client.start()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(refresh.mock.calls.length).toBeLessThanOrEqual(8)
    stop()
  })
})

describe('idle timeout across tabs', () => {
  it('does not sign out a tab while the user is active in another tab', async () => {
    vi.useFakeTimers()
    const options = {
      idleTimeout: 10_000,
      idleWarning: 3_000,
      refreshInterval: false,
      refreshOnFocus: false,
      syncTabs: 'idle-test',
    } as const
    vi.stubGlobal('BroadcastChannel', undefined)
    const active = createAuthClient(fakeAdapter(), options)
    const idle = createAuthClient(fakeAdapter(), options)
    const stopActive = active.start()
    const stopIdle = idle.start()
    // The user keeps working in the active tab for 30 seconds.
    for (let i = 0; i < 6; i++) {
      await vi.advanceTimersByTimeAsync(5_000)
      active.keepAlive()
    }
    expect(idle.getState().status).toBe('authenticated')
    expect(idle.getState().idleDeadline).toBeNull()
    stopActive()
    stopIdle()
  })
})

describe('sign-out', () => {
  it('does not leave an unhandled rejection when the idle sign-out fails on the server', async () => {
    vi.useFakeTimers()
    const unhandled = vi.fn()
    process.on('unhandledRejection', unhandled)
    const client = createAuthClient(
      fakeAdapter({ signOut: vi.fn().mockRejectedValue(new Error('offline')) }),
      { ...quiet, idleTimeout: 5_000, idleWarning: 1_000 },
    )
    const stop = client.start()
    await vi.advanceTimersByTimeAsync(6_000)
    vi.useRealTimers()
    await new Promise((resolve) => setTimeout(resolve, 10))
    process.off('unhandledRejection', unhandled)
    expect(client.getState().status).toBe('unauthenticated')
    expect(unhandled).not.toHaveBeenCalled()
    stop()
  })

  it('does not come back signed in when the server sign-out failed', async () => {
    const getSession = vi.fn(async (): Promise<AuthSession | null> => session)
    const signOut = vi.fn().mockRejectedValueOnce(new Error('offline'))
    const client = createAuthClient(fakeAdapter({ getSession, signOut }), quiet)
    await client.ready()
    await expect(client.signOut()).rejects.toThrow('offline')
    // The cookie is still valid on the server; the next focus check must not restore it.
    signOut.mockRejectedValueOnce(new Error('still offline'))
    await client.load()
    expect(client.getState().status).toBe('unauthenticated')
    // Once the server is back, the sign-out goes through before anything else.
    await client.load()
    expect(signOut).toHaveBeenCalledTimes(3)
    getSession.mockResolvedValue(null)
    await client.load()
    expect(client.getState().status).toBe('unauthenticated')
    // Signing in again clears the pending sign-out.
    await client.signIn({ email: 'a@b.co', password: 'x' })
    getSession.mockResolvedValue(session)
    await client.load()
    expect(client.getState().status).toBe('authenticated')
  })
})

describe('switchOrganization', () => {
  it('keeps the organization the user picked last, whatever order the responses arrive in', async () => {
    const resolvers: Record<string, (s: AuthSession) => void> = {}
    const switchOrganization = vi.fn(
      (id: string) => new Promise<AuthSession>((resolve) => (resolvers[id] = resolve)),
    )
    const client = createAuthClient(fakeAdapter({ switchOrganization }), quiet)
    await client.ready()
    const toB = client.switchOrganization('b')
    const toC = client.switchOrganization('c')
    resolvers.c?.({ ...session, activeOrganizationId: 'c' })
    await toC
    resolvers.b?.({ ...session, activeOrganizationId: 'b' })
    await toB
    expect(client.getState().session?.activeOrganizationId).toBe('c')
  })
})

describe('memory adapter password reset', () => {
  it('only accepts a reset code for the account it was sent to', async () => {
    const adapter = memoryAdapter({
      latency: 0,
      users: [ada, { email: 'eve@example.com', password: 'hunter22', name: 'Eve' }],
      onCode: () => {},
    })
    await adapter.requestPasswordReset?.('eve@example.com')
    const eveCode = adapter.lastCode('eve@example.com', 'reset-password') as string
    await expect(
      adapter.resetPassword?.({ email: ada.email, token: eveCode, password: 'taken over' }),
    ).rejects.toMatchObject({ code: 'expired-token' })
    await expect(
      adapter.signIn({ email: ada.email, password: 'taken over' }),
    ).rejects.toMatchObject({ code: 'invalid-credentials' })
  })
})
