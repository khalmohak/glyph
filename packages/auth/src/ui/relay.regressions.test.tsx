import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ada, grace, renderWithAuth, setup } from '../test/render'
import { TwoFactorForm } from './code-forms'
import { MagicLinkCallback } from './magic-link-callback'
import { OrganizationSwitcher } from './organization-switcher'
import { IdleWarningDialog, SessionExpiredDialog } from './session-dialogs'
import { SignInForm } from './sign-in-form'
import { SignUpForm } from './sign-up-form'

// Regressions found by the Relay sample app.

const user = () => userEvent.setup()

function codesInbox() {
  const codes: Record<string, string> = {}
  return {
    codes,
    onCode: (code: { kind: string; email: string; code: string }) => {
      codes[`${code.kind}:${code.email}`] = code.code
    },
  }
}

describe('SessionExpiredDialog with two-step accounts (A5)', () => {
  it('asks for the code inside the dialog instead of dead-ending', async () => {
    const inbox = codesInbox()
    const ctx = setup({ onCode: inbox.onCode })
    await ctx.client.signIn({ email: grace.email, password: grace.password })
    await ctx.client.verifySecondFactor({ code: inbox.codes[`two-factor:${grace.email}`] ?? '' })
    renderWithAuth(<SessionExpiredDialog />, ctx.client)
    act(() => ctx.client.markExpired())
    await user().type(await screen.findByLabelText('Password'), grace.password)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    const code = await screen.findByRole('textbox', { name: /code/i })
    expect(screen.queryByText(/Finish signing in on the sign-in page/)).not.toBeInTheDocument()
    await user().type(code, inbox.codes[`two-factor:${grace.email}`] ?? '')
    await waitFor(() => expect(ctx.client.getState().expired).toBe(false))
    expect(ctx.client.getState().status).toBe('authenticated')
  })
})

describe('SessionExpiredDialog code step errors', () => {
  it('clears a wrong code and shows the server’s message', async () => {
    const inbox = codesInbox()
    const ctx = setup({ onCode: inbox.onCode })
    await ctx.client.signIn({ email: grace.email, password: grace.password })
    await ctx.client.verifySecondFactor({ code: inbox.codes[`two-factor:${grace.email}`] ?? '' })
    renderWithAuth(<SessionExpiredDialog />, ctx.client)
    act(() => ctx.client.markExpired())
    await user().type(await screen.findByLabelText('Password'), grace.password)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    const code = await screen.findByRole('textbox', { name: /code/i })
    await user().type(code, '000000')
    expect(await screen.findByText(/That code isn’t right/)).toBeInTheDocument()
    expect(code).toHaveValue('')
    await user().click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByText('Enter the 6-digit code.')).toBeInTheDocument()
  })
})

describe('two-step copy (A7)', () => {
  it('says the code was emailed when the server emails it', async () => {
    const ctx = setup()
    renderWithAuth(<SignInForm />, ctx.client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), grace.email)
    await user().type(screen.getByLabelText(/^Password/), grace.password)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    // The address is emphasised in its own element, like the email-verification step.
    expect(await screen.findByText(/we emailed to/)).toBeInTheDocument()
    expect(screen.getByText(grace.email)).toBeInTheDocument()
    expect(screen.queryByText(/authenticator app/)).not.toBeInTheDocument()
  })

  it('keeps the authenticator wording by default and accepts custom copy', async () => {
    const ctx = setup()
    const { unmount } = renderWithAuth(<TwoFactorForm />, ctx.client)
    expect(await screen.findByText(/authenticator app/)).toBeInTheDocument()
    unmount()
    renderWithAuth(<TwoFactorForm method="sms" />, ctx.client)
    expect(await screen.findByText(/texted to your phone/)).toBeInTheDocument()
  })
})

describe('SignUpForm extra fields (A6)', () => {
  it('validates extra fields and passes them to signUp', async () => {
    const ctx = setup({ requireEmailVerification: false })
    const signUp = vi.spyOn(ctx.client, 'signUp')
    renderWithAuth(
      <SignUpForm
        collectName={false}
        extraFields={[
          { name: 'inviteCode', label: 'Invite code', required: 'Enter your invite code.' },
          { name: 'workspace', label: 'Workspace name' },
        ]}
      />,
      ctx.client,
    )
    await user().type(await screen.findByRole('textbox', { name: /email/i }), 'new@example.com')
    await user().type(screen.getByLabelText(/^Password/), 'long enough')
    await user().click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Enter your invite code.')).toBeInTheDocument()
    expect(signUp).not.toHaveBeenCalled()
    await user().type(screen.getByRole('textbox', { name: /Invite code/ }), 'INV-9')
    await user().type(screen.getByRole('textbox', { name: /Workspace name/ }), 'Acme')
    await user().click(screen.getByRole('button', { name: 'Create account' }))
    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'long enough',
        extra: { inviteCode: 'INV-9', workspace: 'Acme' },
      }),
    )
  })
})

describe('OrganizationSwitcher labels (A8)', () => {
  it('uses the product’s own word for organizations', async () => {
    const ctx = setup()
    await ctx.client.signIn({ email: ada.email, password: ada.password })
    renderWithAuth(
      <OrganizationSwitcher label="Workspaces" createLabel="New workspace" onCreate={() => {}} />,
      ctx.client,
    )
    await user().click(await screen.findByRole('button', { name: /Analytical Engines/ }))
    expect(await screen.findByText('Workspaces')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'New workspace' })).toBeInTheDocument()
    expect(screen.queryByText('Organizations')).not.toBeInTheDocument()
  })
})

describe('MagicLinkCallback (A4)', () => {
  it('signs in with the link token and reports success', async () => {
    const inbox = codesInbox()
    const ctx = setup({ onCode: inbox.onCode })
    await ctx.client.signIn({ email: ada.email, magicLink: true })
    const token = inbox.codes[`magic-link:${ada.email}`] ?? ''
    const onSuccess = vi.fn()
    renderWithAuth(<MagicLinkCallback token={token} onSuccess={onSuccess} />, ctx.client)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(ctx.client.getState().status).toBe('authenticated')
  })

  it('reads the token from the URL by default', async () => {
    const inbox = codesInbox()
    const ctx = setup({ onCode: inbox.onCode })
    await ctx.client.signIn({ email: ada.email, magicLink: true })
    window.history.pushState({}, '', `/magic?t=${inbox.codes[`magic-link:${ada.email}`]}`)
    const onSuccess = vi.fn()
    renderWithAuth(<MagicLinkCallback param="t" onSuccess={onSuccess} />, ctx.client)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    window.history.pushState({}, '', '/')
  })

  it('explains a link without a token', async () => {
    const ctx = setup()
    renderWithAuth(<MagicLinkCallback token={null} />, ctx.client)
    expect(await screen.findByText(/incomplete/i)).toBeInTheDocument()
  })

  it('continues to the code step for two-step accounts', async () => {
    const ctx = setup()
    vi.spyOn(ctx.client, 'completeMagicLink').mockResolvedValue({
      status: 'needs-second-factor',
      method: 'sms',
    })
    renderWithAuth(<MagicLinkCallback token="tok" />, ctx.client)
    expect(await screen.findByText(/texted to your phone/)).toBeInTheDocument()
  })

  it('continues to email verification when the server asks for it', async () => {
    const ctx = setup()
    vi.spyOn(ctx.client, 'completeMagicLink').mockResolvedValue({
      status: 'needs-verification',
      email: 'new@example.com',
    })
    renderWithAuth(<MagicLinkCallback token="tok" />, ctx.client)
    expect(await screen.findByRole('textbox', { name: /Verification code/ })).toBeInTheDocument()
  })

  it('shows an error with a way back when the link is used up', async () => {
    const ctx = setup()
    renderWithAuth(<MagicLinkCallback token="nope" signInHref="/sign-in" />, ctx.client)
    expect(await screen.findByText(/expired/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in')
  })
})

describe('IdleWarningDialog (A9)', () => {
  it('calls onSignOut after the automatic idle sign-out too', async () => {
    const ctx = setup({}, { idleTimeout: 300, idleWarning: 200 })
    await ctx.client.signIn({ email: ada.email, password: ada.password })
    const onSignOut = vi.fn()
    renderWithAuth(<IdleWarningDialog onSignOut={onSignOut} />, ctx.client)
    await waitFor(() => expect(ctx.client.getState().status).toBe('unauthenticated'), {
      timeout: 2000,
    })
    await waitFor(() => expect(onSignOut).toHaveBeenCalledTimes(1))
  })
})
