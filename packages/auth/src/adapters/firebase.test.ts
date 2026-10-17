import { beforeEach, describe, expect, it, vi } from 'vitest'

const fb = vi.hoisted(() => {
  const user = {
    uid: 'u1',
    email: 'ada@example.com',
    displayName: 'Ada',
    photoURL: null,
    emailVerified: true,
    providerData: [{ providerId: 'password' }],
    reload: vi.fn(async () => {}),
    getIdToken: vi.fn(async () => 'id-token'),
  }
  return {
    user,
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    sendEmailVerification: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    confirmPasswordReset: vi.fn(),
    updateProfile: vi.fn(),
    signOut: vi.fn(),
    onIdTokenChanged: vi.fn(),
    getIdTokenResult: vi.fn(async () => ({
      claims: { roles: ['admin'], permissions: ['x:y'] },
      expirationTime: '2030-01-01T00:00:00Z',
    })),
  }
})

vi.mock('firebase/auth', () => {
  class Provider {
    constructor(public id = 'provider') {}
  }
  return {
    ...fb,
    GoogleAuthProvider: Provider,
    GithubAuthProvider: Provider,
    OAuthProvider: Provider,
  }
})

import type { Auth } from 'firebase/auth'
import { firebaseAdapter, firebaseError } from './firebase'

function fakeAuth(currentUser: typeof fb.user | null = fb.user): Auth {
  return { currentUser, authStateReady: vi.fn(async () => {}) } as unknown as Auth
}

beforeEach(() => {
  vi.clearAllMocks()
  fb.user.emailVerified = true
})

describe('firebaseAdapter', () => {
  it('reads the session, with roles and permissions from custom claims', async () => {
    const adapter = firebaseAdapter(fakeAuth())
    expect(await adapter.getSession()).toEqual({
      user: {
        id: 'u1',
        email: 'ada@example.com',
        name: 'Ada',
        image: undefined,
        emailVerified: true,
      },
      expiresAt: Date.parse('2030-01-01T00:00:00Z'),
      roles: ['admin'],
      permissions: ['x:y'],
    })
    expect(await firebaseAdapter(fakeAuth(null)).getSession()).toBeNull()
    expect(adapter.capabilities).toMatchObject({ emailCode: false, passwordResetMethod: 'link' })
  })

  it('treats unverified password accounts as signed out and asks them to verify', async () => {
    fb.user.emailVerified = false
    fb.signInWithEmailAndPassword.mockResolvedValue({ user: fb.user })
    const adapter = firebaseAdapter(fakeAuth())
    expect(await adapter.getSession()).toBeNull()
    expect(await adapter.signIn({ email: 'ada@example.com', password: 'pw' })).toEqual({
      status: 'needs-verification',
      email: 'ada@example.com',
    })
    expect(fb.sendEmailVerification).toHaveBeenCalled()
  })

  it('signs in with a password, a popup or a redirect', async () => {
    fb.signInWithEmailAndPassword.mockResolvedValue({ user: fb.user })
    fb.signInWithPopup.mockResolvedValue({ user: fb.user })
    const adapter = firebaseAdapter(fakeAuth())
    expect(await adapter.signIn({ email: 'a', password: 'b' })).toMatchObject({
      status: 'signed-in',
    })
    expect(await adapter.signIn({ provider: 'google' })).toMatchObject({ status: 'signed-in' })
    const redirecting = firebaseAdapter(fakeAuth(), { oauthFlow: 'redirect' })
    expect(await redirecting.signIn({ provider: 'github' })).toEqual({ status: 'redirecting' })
    await expect(adapter.signIn({ provider: 'facebook' })).rejects.toThrow(/No Firebase provider/)
    await expect(adapter.signIn({ email: 'a', magicLink: true })).rejects.toMatchObject({
      code: 'not-supported',
    })
  })

  it('signs up with a name and sends the verification email', async () => {
    fb.createUserWithEmailAndPassword.mockResolvedValue({ user: fb.user })
    const adapter = firebaseAdapter(fakeAuth())
    expect(await adapter.signUp?.({ email: 'a@b.co', password: 'pw', name: 'Ada' })).toEqual({
      status: 'needs-verification',
      email: 'a@b.co',
    })
    expect(fb.updateProfile).toHaveBeenCalledWith(fb.user, { displayName: 'Ada' })
    const noVerify = firebaseAdapter(fakeAuth(), { requireEmailVerification: false })
    expect(await noVerify.signUp?.({ email: 'a@b.co', password: 'pw' })).toMatchObject({
      status: 'signed-in',
    })
  })

  it('maps Firebase error codes to field errors', async () => {
    fb.createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' })
    const adapter = firebaseAdapter(fakeAuth())
    await expect(adapter.signUp?.({ email: 'a', password: 'b' })).rejects.toMatchObject({
      code: 'email-taken',
      fieldErrors: { email: expect.stringMatching(/already exists/) },
    })
    expect(firebaseError({ code: 'auth/wrong-password' }).code).toBe('invalid-credentials')
    expect(firebaseError(new Error('x')).message).toMatch(/Something went wrong/)
  })

  it('handles reset, refresh, profile, headers and subscriptions', async () => {
    const adapter = firebaseAdapter(fakeAuth())
    await adapter.requestPasswordReset?.('a@b.co')
    expect(fb.sendPasswordResetEmail).toHaveBeenCalled()
    await adapter.resetPassword?.({ token: 'oob', password: 'new' })
    expect(fb.confirmPasswordReset).toHaveBeenCalledWith(expect.anything(), 'oob', 'new')
    expect(await adapter.refresh?.()).toMatchObject({ user: { id: 'u1' } })
    expect(fb.user.getIdToken).toHaveBeenCalledWith(true)
    await adapter.resendVerification?.('a@b.co')
    await adapter.updateUser?.({ name: 'Countess' } as never)
    expect(fb.updateProfile).toHaveBeenCalledWith(fb.user, { displayName: 'Countess' })
    expect(await adapter.getAuthHeaders?.()).toEqual({ Authorization: 'Bearer id-token' })
    await adapter.signOut()
    expect(fb.signOut).toHaveBeenCalled()

    let callback: (user: unknown) => void = () => {}
    fb.onIdTokenChanged.mockImplementation((_auth, cb) => {
      callback = cb
      return () => {}
    })
    const listener = vi.fn()
    adapter.subscribe?.(listener)
    callback(null)
    await vi.waitFor(() => expect(listener).toHaveBeenCalledWith(null))

    const signedOut = firebaseAdapter(fakeAuth(null))
    expect(await signedOut.refresh?.()).toBeNull()
    expect(await signedOut.getAuthHeaders?.()).toEqual({})
    await expect(signedOut.updateUser?.({})).rejects.toThrow(/Sign in first/)
  })
})
