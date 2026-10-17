import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SignInResult } from '../core/types'
import { ada, renderWithAuth, setup } from '../test/render'
import { TwoFactorForm } from './code-forms'
import { OrganizationSwitcher } from './organization-switcher'
import { IdleWarningDialog, SessionExpiredDialog } from './session-dialogs'
import { UserMenu } from './user-menu'

const user = () => userEvent.setup()

function trackUnhandled() {
  const seen = vi.fn()
  process.on('unhandledRejection', seen)
  return {
    seen,
    async stop() {
      await new Promise((resolve) => setTimeout(resolve, 20))
      process.off('unhandledRejection', seen)
    },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('code forms', () => {
  it('submits a code once when Enter follows the automatic submit', async () => {
    const { client } = setup()
    let finish: (result: SignInResult) => void = () => {}
    const verify = vi
      .spyOn(client, 'verifySecondFactor')
      .mockImplementation(() => new Promise((resolve) => (finish = resolve)))
    renderWithAuth(<TwoFactorForm />, client)
    const input = await screen.findByRole('textbox', { name: /code/i })
    // The sixth digit submits on its own; a habitual Enter right after must not send it again.
    await user().type(input, '123456{Enter}')
    await user().click(screen.getByRole('button', { name: 'Verify' }))
    await act(async () => finish({ status: 'needs-second-factor' }))
    expect(verify).toHaveBeenCalledTimes(1)
  })
})

describe('sign-out buttons when the server is unreachable', () => {
  async function signedIn() {
    const ctx = setup()
    await ctx.client.signIn({ email: ada.email, password: ada.password })
    vi.spyOn(ctx.adapter, 'signOut').mockRejectedValue(new Error('offline'))
    return ctx
  }

  it('UserMenu still signs out locally and calls onSignOut, without an unhandled rejection', async () => {
    const { client } = await signedIn()
    const onSignOut = vi.fn()
    const unhandled = trackUnhandled()
    renderWithAuth(<UserMenu onSignOut={onSignOut} colorMode={false} />, client)
    await user().click(await screen.findByRole('button', { name: /Ada Lovelace/ }))
    await user().click(await screen.findByRole('menuitem', { name: 'Sign out' }))
    await waitFor(() => expect(onSignOut).toHaveBeenCalled())
    await unhandled.stop()
    expect(client.getState().status).toBe('unauthenticated')
    expect(unhandled.seen).not.toHaveBeenCalled()
  })

  it('SessionExpiredDialog signs out without an unhandled rejection', async () => {
    const { client } = await signedIn()
    const onSignOut = vi.fn()
    const unhandled = trackUnhandled()
    renderWithAuth(<SessionExpiredDialog onSignOut={onSignOut} />, client)
    act(() => client.markExpired())
    await user().click(await screen.findByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(onSignOut).toHaveBeenCalled())
    await unhandled.stop()
    expect(unhandled.seen).not.toHaveBeenCalled()
  })

  it('IdleWarningDialog signs out without an unhandled rejection', async () => {
    const ctx = setup({}, { idleTimeout: 2_000, idleWarning: 1_900 })
    await ctx.client.signIn({ email: ada.email, password: ada.password })
    vi.spyOn(ctx.adapter, 'signOut').mockRejectedValue(new Error('offline'))
    const onSignOut = vi.fn()
    const unhandled = trackUnhandled()
    renderWithAuth(<IdleWarningDialog onSignOut={onSignOut} />, ctx.client)
    await user().click(await screen.findByRole('button', { name: 'Sign out' }, { timeout: 3000 }))
    await waitFor(() => expect(onSignOut).toHaveBeenCalled())
    await unhandled.stop()
    expect(unhandled.seen).not.toHaveBeenCalled()
  })
})

describe('OrganizationSwitcher', () => {
  it('reports a failed switch instead of throwing it away', async () => {
    const ctx = setup()
    await ctx.client.signIn({ email: ada.email, password: ada.password })
    vi.spyOn(ctx.adapter as Required<typeof ctx.adapter>, 'switchOrganization').mockRejectedValue(
      new Error('offline'),
    )
    const onError = vi.fn()
    const unhandled = trackUnhandled()
    renderWithAuth(<OrganizationSwitcher onError={onError} />, ctx.client)
    await user().click(await screen.findByRole('button', { name: /Analytical Engines/ }))
    await user().click(await screen.findByRole('menuitemradio', { name: /Difference Ltd/ }))
    await waitFor(() => expect(onError).toHaveBeenCalled())
    await unhandled.stop()
    expect(unhandled.seen).not.toHaveBeenCalled()
    expect(ctx.client.getState().session?.activeOrganizationId).toBe('org_1')
  })
})
