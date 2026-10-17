import { afterEach, describe, expect, it, vi } from 'vitest'
import { memoryAdapter } from '../adapters/memory'
import { ada, setup } from '../test/render'
import { createAuthClient } from './client'
import { AuthError } from './errors'
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
      organizations: false,
      oauthProviders: [],
    },
    getSession: vi.fn(async () => session),
    signIn: vi.fn(async () => ({ status: 'signed-in' as const, session })),
    signOut: vi.fn(async () => {}),
    ...overrides,
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createAuthClient', () => {
  it('starts loading, then reflects the adapter session', async () => {
    const { client } = setup()
    expect(client.getState().status).toBe('loading')
    await client.ready()
    expect(client.getState()).toMatchObject({ status: 'unauthenticated', user: null })

    const listener = vi.fn()
    client.subscribe(listener)
    await client.signIn({ email: ada.email, password: ada.password })
    expect(client.getState()).toMatchObject({ status: 'authenticated', expired: false })
    expect(client.getState().user).toMatchObject({ email: ada.email, name: ada.name })
    expect(listener).toHaveBeenCalled()
  })

  it('leaves the state alone while a sign-in needs another step', async () => {
    const { client, adapter } = setup()
    await client.ready()
    const result = await client.signIn({ email: 'grace@example.com', password: 'cobol rules' })
    expect(result).toMatchObject({
      status: 'needs-second-factor',
      method: 'email',
      challenge: expect.any(String),
    })
    expect(client.getState().status).toBe('unauthenticated')
    const code = adapter.lastCode('grace@example.com', 'two-factor') as string
    await client.verifySecondFactor({ code })
    expect(client.getState().status).toBe('authenticated')
  })

  it('throws AuthErrors with field messages', async () => {
    const { client } = setup()
    await expect(client.signIn({ email: ada.email, password: 'nope' })).rejects.toMatchObject({
      name: 'AuthError',
      code: 'invalid-credentials',
    })
    await expect(
      client.signUp({ email: ada.email, password: 'long enough' }),
    ).rejects.toMatchObject({ fieldErrors: { email: expect.stringMatching(/already exists/) } })
  })

  it('wraps unknown and network errors', async () => {
    const client = createAuthClient(
      fakeAdapter({
        signIn: async () => {
          throw new TypeError('Failed to fetch')
        },
        signOut: async () => {
          throw new Error('boom')
        },
      }),
    )
    await expect(client.signIn({ email: 'a', password: 'b' })).rejects.toMatchObject({
      code: 'network',
    })
    // Signing out still clears the local session when the server call fails.
    await client.ready()
    await expect(client.signOut()).rejects.toThrow('boom')
    expect(client.getState().status).toBe('unauthenticated')
  })

  it('reports sign-outs with their reason', async () => {
    const onSignOut = vi.fn()
    const { client } = setup({}, { onSignOut })
    await client.signIn({ email: ada.email, password: ada.password })
    await client.signOut()
    expect(onSignOut).toHaveBeenCalledWith('user')
    expect(client.getState().session).toBeNull()
  })

  it('keeps the session through a network blip, but not through a remote sign-out', async () => {
    const getSession = vi.fn(async (): Promise<AuthSession | null> => session)
    const onSignOut = vi.fn()
    const client = createAuthClient(fakeAdapter({ getSession }), { onSignOut })
    await client.ready()
    getSession.mockRejectedValueOnce(new Error('offline'))
    await client.load()
    expect(client.getState()).toMatchObject({ status: 'authenticated' })
    expect(client.getState().error?.message).toBe('offline')
    getSession.mockResolvedValueOnce(null)
    await client.load()
    expect(client.getState().status).toBe('unauthenticated')
    expect(onSignOut).toHaveBeenCalledWith('remote')
  })

  it('is unauthenticated with an error when the first load fails', async () => {
    const client = createAuthClient(
      fakeAdapter({ getSession: vi.fn().mockRejectedValue(new Error('down')) }),
    )
    const state = await client.ready()
    expect(state.status).toBe('unauthenticated')
    expect(state.error).toBeInstanceOf(AuthError)
  })

  it('marks the session expired when a refresh finds it gone', async () => {
    const { client, adapter } = setup()
    await client.signIn({ email: ada.email, password: ada.password })
    adapter.expireSession()
    expect(await client.refresh()).toBeNull()
    expect(client.getState()).toMatchObject({ status: 'authenticated', expired: true })
    // Signing in again clears it.
    await client.signIn({ email: ada.email, password: ada.password })
    expect(client.getState().expired).toBe(false)
  })

  it('shares one refresh between concurrent callers', async () => {
    const refresh = vi.fn(async () => session)
    const client = createAuthClient(fakeAdapter({ refresh }))
    await client.ready()
    await Promise.all([client.refresh(), client.refresh(), client.refresh()])
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('reports refresh errors without signing out, unless they are 401s', async () => {
    const refresh = vi.fn().mockRejectedValueOnce(new Error('flaky'))
    const client = createAuthClient(fakeAdapter({ refresh }))
    await client.ready()
    await client.refresh()
    expect(client.getState()).toMatchObject({ expired: false })
    expect(client.getState().error?.message).toBe('flaky')
    refresh.mockRejectedValueOnce(new AuthError('gone', { status: 401 }))
    await client.refresh()
    expect(client.getState().expired).toBe(true)
  })

  describe('fetch', () => {
    it('adds the adapter headers and credentials', async () => {
      const fetchMock = vi.fn(async () => new Response('ok'))
      vi.stubGlobal('fetch', fetchMock)
      const client = createAuthClient(
        fakeAdapter({
          getAuthHeaders: () => ({ Authorization: 'Bearer t' }),
          credentials: 'include',
        }),
      )
      await client.ready()
      await client.fetch('/api/me', { headers: { 'X-A': '1' } })
      const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
      const headers = init.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer t')
      expect(headers.get('X-A')).toBe('1')
      expect(init.credentials).toBe('include')
    })

    it('refreshes once on a 401 and retries', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(new Response('', { status: 401 }))
        .mockResolvedValueOnce(new Response('ok', { status: 200 }))
      vi.stubGlobal('fetch', fetchMock)
      const refresh = vi.fn(async () => session)
      const client = createAuthClient(fakeAdapter({ refresh }))
      await client.ready()
      const response = await client.fetch('/api/invoices')
      expect(response.status).toBe(200)
      expect(refresh).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('marks the session expired when the retry is rejected too', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('', { status: 401 })),
      )
      const client = createAuthClient(fakeAdapter({ refresh: async () => session }))
      await client.ready()
      const response = await client.fetch('/api/invoices')
      expect(response.status).toBe(401)
      expect(client.getState().expired).toBe(true)
    })

    it('marks the session expired when refreshing fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('', { status: 401 })),
      )
      const client = createAuthClient(fakeAdapter({ refresh: async () => null }))
      await client.ready()
      await client.fetch('/api/invoices')
      expect(client.getState().expired).toBe(true)
    })

    it('passes 401s through untouched when signed out', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('', { status: 401 })),
      )
      const refresh = vi.fn()
      const client = createAuthClient(fakeAdapter({ getSession: async () => null, refresh }))
      await client.ready()
      await client.fetch('/api/public')
      expect(refresh).not.toHaveBeenCalled()
    })
  })

  it('throws a clear error for flows the adapter lacks', async () => {
    const client = createAuthClient(fakeAdapter())
    for (const action of [
      () => client.signUp({ email: 'a', password: 'b' }),
      () => client.requestPasswordReset('a'),
      () => client.resetPassword({ token: 't', password: 'p' }),
      () => client.verifyEmail({ email: 'a', code: '1' }),
      () => client.resendVerification('a'),
      () => client.verifySecondFactor({ code: '1' }),
      () => client.switchOrganization('o'),
      () => client.updateUser({}),
    ])
      await expect(action()).rejects.toMatchObject({ code: 'not-supported' })
  })

  it('switches organizations and updates the user', async () => {
    const { client } = setup()
    await client.signIn({ email: ada.email, password: ada.password })
    expect(client.getState().session?.activeOrganizationId).toBe('org_1')
    await client.switchOrganization('org_2')
    expect(client.getState().session?.activeOrganizationId).toBe('org_2')
    await client.updateUser({ name: 'Countess Lovelace' })
    expect(client.getState().user).toMatchObject({ name: 'Countess Lovelace' })
  })

  it('checks permissions and roles', async () => {
    const { client } = setup()
    await client.signIn({ email: ada.email, password: ada.password })
    expect(client.can('invoices:write')).toBe(true)
    expect(client.can('billing:manage')).toBe(false)
    expect(client.hasRole('admin')).toBe(true)
    expect(client.hasRole(['owner', 'member'])).toBe(false)
  })

  describe('lifecycle', () => {
    it('refreshes before the session expires', async () => {
      vi.useFakeTimers()
      const refresh = vi.fn(async () => ({ ...session, expiresAt: Date.now() + 120_000 }))
      const client = createAuthClient(
        fakeAdapter({
          getSession: async () => ({ ...session, expiresAt: Date.now() + 60_000 }),
          refresh,
        }),
        { refreshInterval: false, refreshOnFocus: false, syncTabs: false },
      )
      const stop = client.start()
      await vi.advanceTimersByTimeAsync(10)
      expect(refresh).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(31_000)
      expect(refresh).toHaveBeenCalledTimes(1)
      stop()
    })

    it('marks the session expired at expiry when the adapter cannot refresh', async () => {
      vi.useFakeTimers()
      const client = createAuthClient(
        fakeAdapter({ getSession: async () => ({ ...session, expiresAt: Date.now() + 40_000 }) }),
        { refreshInterval: false, refreshOnFocus: false, syncTabs: false },
      )
      const stop = client.start()
      await vi.advanceTimersByTimeAsync(11_000)
      expect(client.getState().expired).toBe(true)
      stop()
    })

    it('re-checks the session on an interval and on focus', async () => {
      vi.useFakeTimers()
      const refresh = vi.fn(async () => session)
      const getSession = vi.fn(async () => session)
      const client = createAuthClient(fakeAdapter({ getSession, refresh }), {
        refreshInterval: 1000,
        syncTabs: false,
      })
      const stop = client.start()
      await vi.advanceTimersByTimeAsync(1001)
      expect(refresh).toHaveBeenCalledTimes(1)
      window.dispatchEvent(new Event('focus'))
      await vi.advanceTimersByTimeAsync(1)
      expect(getSession).toHaveBeenCalledTimes(2)
      stop()
      await vi.advanceTimersByTimeAsync(5000)
      expect(refresh).toHaveBeenCalledTimes(1)
    })

    it('warns, then signs out after the idle timeout; keepAlive resets it', async () => {
      vi.useFakeTimers()
      const onSignOut = vi.fn()
      const client = createAuthClient(fakeAdapter(), {
        idleTimeout: 10_000,
        idleWarning: 3_000,
        refreshInterval: false,
        refreshOnFocus: false,
        syncTabs: false,
        onSignOut,
      })
      const stop = client.start()
      await vi.advanceTimersByTimeAsync(7_100)
      expect(client.getState().idleDeadline).not.toBeNull()
      client.keepAlive()
      expect(client.getState().idleDeadline).toBeNull()
      // Activity pushes the deadline back.
      await vi.advanceTimersByTimeAsync(5_000)
      window.dispatchEvent(new Event('keydown'))
      await vi.advanceTimersByTimeAsync(6_000)
      expect(client.getState().idleDeadline).toBeNull()
      await vi.advanceTimersByTimeAsync(5_000)
      expect(client.getState().status).toBe('unauthenticated')
      expect(onSignOut).toHaveBeenCalledWith('idle')
      stop()
    })

    it('starts once however many times start() is called', async () => {
      const getSession = vi.fn(async () => session)
      const client = createAuthClient(fakeAdapter({ getSession }), { syncTabs: false })
      const stopA = client.start()
      const stopB = client.start()
      await client.ready()
      expect(getSession).toHaveBeenCalledTimes(1)
      stopA()
      stopA()
      stopB()
    })

    it('follows pushed sessions from subscribing adapters', async () => {
      let push: (s: AuthSession | null) => void = () => {}
      const onSignOut = vi.fn()
      const client = createAuthClient(
        fakeAdapter({
          subscribe: (listener) => {
            push = listener
            return () => {}
          },
        }),
        { syncTabs: false, onSignOut },
      )
      const stop = client.start()
      await client.ready()
      push(null)
      expect(client.getState().status).toBe('unauthenticated')
      expect(onSignOut).toHaveBeenCalledWith('remote')
      stop()
    })
  })

  describe('tab sync', () => {
    it('updates other tabs over BroadcastChannel', async () => {
      const shared = { users: [ada], latency: 0, persist: 'local' as const, onCode: () => {} }
      localStorage.clear()
      const tabA = createAuthClient(memoryAdapter({ ...shared, storageKey: 'sync-test' }), {
        refreshOnFocus: false,
        syncTabs: 'sync-test',
      })
      const tabB = createAuthClient(memoryAdapter({ ...shared, storageKey: 'sync-test' }), {
        refreshOnFocus: false,
        syncTabs: 'sync-test',
      })
      const stopA = tabA.start()
      const stopB = tabB.start()
      await Promise.all([tabA.ready(), tabB.ready()])
      await tabA.signIn({ email: ada.email, password: ada.password })
      await vi.waitFor(() => expect(tabB.getState().status).toBe('authenticated'))
      await tabB.signOut()
      await vi.waitFor(() => expect(tabA.getState().status).toBe('unauthenticated'))
      stopA()
      stopB()
    })

    it('falls back to storage events without BroadcastChannel', async () => {
      vi.stubGlobal('BroadcastChannel', undefined)
      const getSession = vi.fn(async () => session)
      const client = createAuthClient(fakeAdapter({ getSession }), {
        refreshOnFocus: false,
        syncTabs: 'storage-test',
      })
      const stop = client.start()
      await client.ready()
      window.dispatchEvent(new StorageEvent('storage', { key: 'storage-test:event' }))
      await vi.waitFor(() => expect(getSession).toHaveBeenCalledTimes(2))
      // This tab's own changes are written for the others.
      await client.signOut()
      expect(localStorage.getItem('storage-test:event')).toBeTruthy()
      stop()
    })
  })
})
