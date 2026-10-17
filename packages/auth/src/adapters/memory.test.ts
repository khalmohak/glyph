import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthError } from '../core/errors'
import { ada } from '../test/render'
import { memoryAdapter } from './memory'

afterEach(() => localStorage.clear())

describe('memoryAdapter', () => {
  it('signs up, emails a code, and verifies it', async () => {
    const onCode = vi.fn()
    const adapter = memoryAdapter({ latency: 0, onCode })
    const result = await adapter.signUp?.({
      email: 'New@Example.com',
      password: 'longpassword',
      name: 'New',
    })
    expect(result).toEqual({ status: 'needs-verification', email: 'new@example.com' })
    expect(onCode).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'verify-email', email: 'new@example.com' }),
    )
    await expect(
      adapter.verifyEmail?.({ email: 'new@example.com', code: '000000x' }),
    ).rejects.toMatchObject({ code: 'invalid-code', fieldErrors: { code: expect.any(String) } })
    const code = adapter.lastCode('new@example.com', 'verify-email') as string
    const verified = await adapter.verifyEmail?.({ email: 'new@example.com', code })
    expect(verified).toMatchObject({
      status: 'signed-in',
      session: { user: { email: 'new@example.com', name: 'New', emailVerified: true } },
    })
    // The password never leaves the "server".
    expect(JSON.stringify(verified)).not.toContain('longpassword')
  })

  it('can skip email verification', async () => {
    const adapter = memoryAdapter({ latency: 0, requireEmailVerification: false })
    expect(await adapter.signUp?.({ email: 'a@b.co', password: 'longpassword' })).toMatchObject({
      status: 'signed-in',
    })
  })

  it('asks unverified users to verify when they sign in', async () => {
    const adapter = memoryAdapter({
      latency: 0,
      onCode: () => {},
      users: [{ email: 'u@x.co', password: 'pw', emailVerified: false }],
    })
    expect(await adapter.signIn({ email: 'u@x.co', password: 'pw' })).toEqual({
      status: 'needs-verification',
      email: 'u@x.co',
    })
    await adapter.resendVerification?.('u@x.co')
    expect(adapter.lastCode('u@x.co')).toMatch(/^\d{6}$/)
  })

  it('resets a password with the emailed token', async () => {
    const adapter = memoryAdapter({ latency: 0, onCode: () => {}, users: [ada] })
    await adapter.requestPasswordReset?.(ada.email)
    // Unknown emails get the same silent success.
    await adapter.requestPasswordReset?.('nobody@example.com')
    expect(adapter.lastCode('nobody@example.com')).toBeUndefined()
    const token = adapter.lastCode(ada.email, 'reset-password') as string
    await adapter.resetPassword?.({ token, password: 'new password' })
    await expect(adapter.resetPassword?.({ token, password: 'again' })).rejects.toMatchObject({
      code: 'expired-token',
    })
    await expect(adapter.signIn({ email: ada.email, password: ada.password })).rejects.toThrow()
    expect(await adapter.signIn({ email: ada.email, password: 'new password' })).toMatchObject({
      status: 'signed-in',
    })
  })

  it('sends and completes magic links', async () => {
    const adapter = memoryAdapter({ latency: 0, onCode: () => {}, users: [ada] })
    expect(await adapter.signIn({ email: ada.email, magicLink: true })).toEqual({
      status: 'magic-link-sent',
      email: ada.email,
    })
    const token = adapter.lastCode(ada.email, 'magic-link') as string
    expect(await adapter.completeMagicLink(token)).toMatchObject({ status: 'signed-in' })
    await expect(adapter.completeMagicLink(token)).rejects.toMatchObject({ code: 'expired-token' })
  })

  it('signs in with OAuth providers', async () => {
    const adapter = memoryAdapter({ latency: 0 })
    expect(await adapter.signIn({ provider: 'github' })).toMatchObject({
      status: 'signed-in',
      session: { user: { email: 'github.user@example.com', name: 'Github User' } },
    })
    // A second sign-in reuses the account.
    await adapter.signIn({ provider: 'github' })
  })

  it('requires the pending sign-in for two-factor codes', async () => {
    const adapter = memoryAdapter({ latency: 0 })
    await expect(adapter.verifySecondFactor?.({ code: '1' })).rejects.toMatchObject({
      code: 'session-expired',
    })
    const withUser = memoryAdapter({
      latency: 0,
      onCode: () => {},
      users: [{ email: 'g@x.co', password: 'p', twoFactor: true }],
    })
    await withUser.signIn({ email: 'g@x.co', password: 'p' })
    await expect(withUser.verifySecondFactor?.({ code: 'nope' })).rejects.toMatchObject({
      code: 'invalid-code',
    })
  })

  it('refreshes, expires and signs out sessions', async () => {
    const adapter = memoryAdapter({ latency: [0, 1], users: [ada], sessionDuration: 1000 })
    expect(await adapter.refresh?.()).toBeNull()
    await adapter.signIn({ email: ada.email, password: ada.password })
    const refreshed = await adapter.refresh?.()
    expect(refreshed?.expiresAt).toBeGreaterThan(Date.now())
    adapter.expireSession()
    expect(await adapter.getSession()).toBeNull()
    await adapter.signOut()
    expect(await adapter.getSession()).toBeNull()
    await expect(adapter.switchOrganization?.('org_1')).rejects.toBeInstanceOf(AuthError)
    await expect(adapter.updateUser?.({})).rejects.toBeInstanceOf(AuthError)
  })

  it('persists to storage so other tabs see the same data', async () => {
    const first = memoryAdapter({ latency: 0, users: [ada], persist: 'local' })
    await first.signIn({ email: ada.email, password: ada.password })
    const second = memoryAdapter({ latency: 0, users: [], persist: 'local' })
    expect(await second.getSession()).toMatchObject({ user: { email: ada.email } })
    localStorage.setItem('glyph-auth-memory', '{broken')
    expect(await first.getSession()).not.toBeNull()
  })

  it('simulates failures', async () => {
    const adapter = memoryAdapter({
      latency: 0,
      fail: (operation) => (operation === 'signIn' ? new AuthError('Service down') : undefined),
    })
    await expect(adapter.signIn({ provider: 'google' })).rejects.toThrow('Service down')
  })

  it('logs codes to the console by default', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {})
    const adapter = memoryAdapter({ latency: 0, users: [ada] })
    await adapter.requestPasswordReset?.(ada.email)
    expect(info).toHaveBeenCalledWith(expect.stringContaining('reset-password'))
    info.mockRestore()
  })
})
