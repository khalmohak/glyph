import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const hooks = vi.hoisted(() => ({
  auth: {
    isLoaded: true,
    isSignedIn: false as boolean,
    orgId: null as string | null,
    orgRole: null as string | null,
    getToken: async () => 'clerk-token',
  },
  user: null as unknown,
  clerk: {} as unknown,
}))

vi.mock('@clerk/react', () => ({
  useAuth: () => hooks.auth,
  useUser: () => ({ user: hooks.user }),
  useClerk: () => hooks.clerk,
}))

import { useAuth } from '../react/provider'
import { ClerkAuthBridge, type ClerkLike, type ClerkUserLike, createClerkBridge } from './clerk'

const clerkUser: ClerkUserLike = {
  id: 'user_1',
  fullName: 'Ada Lovelace',
  imageUrl: 'https://img/ada.png',
  primaryEmailAddress: { emailAddress: 'ada@example.com', verification: { status: 'verified' } },
  publicMetadata: { roles: ['admin'], permissions: ['billing:*'] },
  organizationMemberships: [{ organization: { id: 'org_1', name: 'Engines' }, role: 'org:admin' }],
}

function fakeClerk(overrides: Record<string, unknown> = {}) {
  const resource = (status: string, extra: Record<string, unknown> = {}) => ({
    status,
    createdSessionId: 'sess_1',
    ...extra,
  })
  const clerk = {
    client: {
      signIn: {
        create: vi.fn(async () => resource('complete')),
        authenticateWithRedirect: vi.fn(async () => {}),
      },
      signUp: { create: vi.fn(async () => resource('complete')) },
    },
    setActive: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    resource,
    ...overrides,
  }
  return clerk
}

function snapshot(clerk: unknown, signedIn: boolean, user: ClerkUserLike | null = clerkUser) {
  return {
    isLoaded: true,
    isSignedIn: signedIn,
    user: signedIn ? user : null,
    orgId: signedIn ? 'org_1' : null,
    orgRole: signedIn ? 'org:admin' : null,
    getToken: async () => 'clerk-token',
    clerk: clerk as ClerkLike,
  }
}

beforeEach(() => {
  hooks.auth.isSignedIn = false
  hooks.user = null
})

describe('createClerkBridge', () => {
  it('waits for Clerk to load, then maps the user, roles and organizations', async () => {
    const bridge = createClerkBridge()
    const pending = bridge.adapter.getSession()
    bridge.update({ ...snapshot(fakeClerk(), true), isLoaded: false })
    bridge.update(snapshot(fakeClerk(), true))
    expect(await pending).toEqual({
      user: {
        id: 'user_1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        image: 'https://img/ada.png',
        emailVerified: true,
      },
      roles: ['admin', 'org:admin'],
      permissions: ['billing:*'],
      organizations: [{ id: 'org_1', name: 'Engines', image: undefined, role: 'org:admin' }],
      activeOrganizationId: 'org_1',
    })
    expect(await bridge.adapter.getAuthHeaders?.()).toEqual({ Authorization: 'Bearer clerk-token' })
  })

  it('signs in with a password and activates the session', async () => {
    const clerk = fakeClerk()
    const bridge = createClerkBridge()
    bridge.update(snapshot(clerk, false))
    const result = bridge.adapter.signIn({ email: 'ada@example.com', password: 'pw' })
    await vi.waitFor(() => expect(clerk.setActive).toHaveBeenCalledWith({ session: 'sess_1' }))
    bridge.update(snapshot(clerk, true))
    expect(await result).toMatchObject({ status: 'signed-in', session: { user: { id: 'user_1' } } })
    expect(clerk.client.signIn.create).toHaveBeenCalledWith({
      identifier: 'ada@example.com',
      password: 'pw',
    })
  })

  it('runs the second-factor step', async () => {
    const attemptSecondFactor = vi.fn(async () => ({ status: 'complete', createdSessionId: 's2' }))
    const clerk = fakeClerk()
    clerk.client.signIn.create.mockResolvedValueOnce(
      clerk.resource('needs_second_factor', { attemptSecondFactor }),
    )
    const bridge = createClerkBridge()
    bridge.update(snapshot(clerk, false))
    expect(await bridge.adapter.signIn({ email: 'a', password: 'b' })).toEqual({
      status: 'needs-second-factor',
    })
    const done = bridge.adapter.verifySecondFactor?.({ code: '123456' })
    await vi.waitFor(() => expect(clerk.setActive).toHaveBeenCalled())
    bridge.update(snapshot(clerk, true))
    expect(await done).toMatchObject({ status: 'signed-in' })
    expect(attemptSecondFactor).toHaveBeenCalledWith({ strategy: 'totp', code: '123456' })
  })

  it('signs up with an email code', async () => {
    const prepareEmailAddressVerification = vi.fn(async () => {})
    const attemptEmailAddressVerification = vi.fn(async () => ({
      status: 'complete',
      createdSessionId: 's3',
    }))
    const clerk = fakeClerk()
    clerk.client.signUp.create.mockResolvedValueOnce(
      clerk.resource('missing_requirements', {
        prepareEmailAddressVerification,
        attemptEmailAddressVerification,
      }),
    )
    const bridge = createClerkBridge()
    bridge.update(snapshot(clerk, false))
    expect(
      await bridge.adapter.signUp?.({ email: 'n@x.co', password: 'pw', name: 'New Person' }),
    ).toEqual({ status: 'needs-verification', email: 'n@x.co' })
    expect(clerk.client.signUp.create).toHaveBeenCalledWith({
      emailAddress: 'n@x.co',
      password: 'pw',
      firstName: 'New',
      lastName: 'Person',
    })
    expect(prepareEmailAddressVerification).toHaveBeenCalledWith({ strategy: 'email_code' })
    await bridge.adapter.resendVerification?.('n@x.co')
    expect(prepareEmailAddressVerification).toHaveBeenCalledTimes(2)
    const done = bridge.adapter.verifyEmail?.({ email: 'n@x.co', code: '111111' })
    await vi.waitFor(() => expect(clerk.setActive).toHaveBeenCalled())
    bridge.update(snapshot(clerk, true))
    expect(await done).toMatchObject({ status: 'signed-in' })
  })

  it('resets passwords with an emailed code', async () => {
    const attemptFirstFactor = vi.fn(async () => ({ status: 'complete', createdSessionId: 's4' }))
    const clerk = fakeClerk()
    clerk.client.signIn.create.mockResolvedValueOnce(
      clerk.resource('needs_first_factor', { attemptFirstFactor }),
    )
    const bridge = createClerkBridge()
    bridge.update(snapshot(clerk, false))
    expect(bridge.adapter.capabilities.passwordResetMethod).toBe('code')
    await bridge.adapter.requestPasswordReset?.('ada@example.com')
    const done = bridge.adapter.resetPassword?.({ token: '222222', password: 'new pw' })
    await vi.waitFor(() => expect(clerk.setActive).toHaveBeenCalled())
    bridge.update(snapshot(clerk, true))
    await done
    expect(attemptFirstFactor).toHaveBeenCalledWith({
      strategy: 'reset_password_email_code',
      code: '222222',
      password: 'new pw',
    })
  })

  it('redirects for OAuth, switches organizations and signs out', async () => {
    const clerk = fakeClerk()
    const bridge = createClerkBridge({ oauthCallbackUrl: '/cb', afterOAuthUrl: '/app' })
    bridge.update(snapshot(clerk, true))
    expect(await bridge.adapter.signIn({ provider: 'google' })).toEqual({ status: 'redirecting' })
    expect(clerk.client.signIn.authenticateWithRedirect).toHaveBeenCalledWith({
      strategy: 'oauth_google',
      redirectUrl: '/cb',
      redirectUrlComplete: '/app',
    })
    expect(await bridge.adapter.switchOrganization?.('org_1')).toMatchObject({
      activeOrganizationId: 'org_1',
    })
    await bridge.adapter.signOut()
    expect(clerk.signOut).toHaveBeenCalled()
  })

  it('maps Clerk API errors to field errors', async () => {
    const clerk = fakeClerk()
    clerk.client.signIn.create.mockRejectedValueOnce({
      errors: [
        {
          code: 'form_password_incorrect',
          message: 'Password is incorrect.',
          meta: { paramName: 'password' },
        },
      ],
    })
    const bridge = createClerkBridge()
    bridge.update(snapshot(clerk, false))
    await expect(bridge.adapter.signIn({ email: 'a', password: 'b' })).rejects.toMatchObject({
      code: 'invalid-credentials',
      fieldErrors: { password: 'Password is incorrect.' },
    })
    await expect(bridge.adapter.verifySecondFactor?.({ code: '1' })).rejects.toMatchObject({
      code: 'session-expired',
    })
    await expect(bridge.adapter.signIn({ email: 'a', magicLink: true })).rejects.toMatchObject({
      code: 'not-supported',
    })
    clerk.client.signIn.create.mockRejectedValueOnce(new Error('weird'))
    await expect(bridge.adapter.signIn({ email: 'a', password: 'b' })).rejects.toThrow(
      /Something went wrong/,
    )
  })

  it('only notifies listeners when the session really changes', () => {
    const clerk = fakeClerk()
    const bridge = createClerkBridge()
    const listener = vi.fn()
    bridge.adapter.subscribe?.(listener)
    bridge.update(snapshot(clerk, true))
    bridge.update(snapshot(clerk, true))
    expect(listener).toHaveBeenCalledTimes(1)
    bridge.update(snapshot(clerk, false))
    expect(listener).toHaveBeenLastCalledWith(null)
  })
})

describe('ClerkAuthBridge', () => {
  function Status() {
    const { status, user } = useAuth()
    return (
      <p>
        {status} {(user as { email?: string } | null)?.email}
      </p>
    )
  }

  it('mirrors Clerk’s state into useAuth', async () => {
    hooks.clerk = fakeClerk()
    const { rerender } = render(
      <ClerkAuthBridge>
        <Status />
      </ClerkAuthBridge>,
    )
    await screen.findByText('unauthenticated')
    hooks.auth = { ...hooks.auth, isSignedIn: true, orgId: 'org_1', orgRole: 'org:admin' }
    hooks.user = clerkUser
    await act(async () => {
      rerender(
        <ClerkAuthBridge>
          <Status />
        </ClerkAuthBridge>,
      )
    })
    await screen.findByText('authenticated ada@example.com')
  })
})
