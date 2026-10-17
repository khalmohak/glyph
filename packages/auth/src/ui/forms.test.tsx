import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ada, grace, renderWithAuth, setup } from '../test/render'
import { TwoFactorForm, VerifyEmailForm } from './code-forms'
import { ForgotPasswordForm, ResetPasswordForm } from './password-forms'
import { MagicLinkSent, SignInForm } from './sign-in-form'
import { SignUpForm } from './sign-up-form'

const user = () => userEvent.setup()

async function typeCode(code: string) {
  await user().type(screen.getByRole('textbox', { name: /code/i }), code)
}

describe('SignInForm', () => {
  it('validates before calling the server', async () => {
    const { client } = setup()
    const signIn = vi.spyOn(client, 'signIn')
    renderWithAuth(<SignInForm />, client)
    await user().click(await screen.findByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter your email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    await user().type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email')
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument()
    expect(signIn).not.toHaveBeenCalled()
  })

  it('shows a wrong password above the form, then signs in', async () => {
    const { client } = setup()
    const onSuccess = vi.fn()
    renderWithAuth(
      <SignInForm onSuccess={onSuccess} signUpHref="/sign-up" forgotPasswordHref="/forgot" />,
      client,
    )
    const email = await screen.findByRole('textbox', { name: /email/i })
    expect(email).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/sign-up',
    )
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot',
    )
    await user().type(email, ada.email)
    const password = screen.getByLabelText(/^Password/)
    await user().type(password, 'wrong')
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('That email and password don’t match.')).toBeInTheDocument()
    await user().clear(password)
    await user().type(password, ada.password)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ user: expect.objectContaining({ email: ada.email }) }),
      ),
    )
  })

  it('continues to the two-step code when the account has one', async () => {
    const { client, adapter } = setup()
    const onSuccess = vi.fn()
    renderWithAuth(<SignInForm onSuccess={onSuccess} />, client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), grace.email)
    await user().type(screen.getByLabelText(/^Password/), grace.password)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(
      await screen.findByRole('heading', { name: 'Two-step verification' }),
    ).toBeInTheDocument()
    await typeCode('000000')
    expect(await screen.findByText(/isn’t right/)).toBeInTheDocument()
    await typeCode(adapter.lastCode(grace.email, 'two-factor') as string)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('verifies unconfirmed emails with a code', async () => {
    const { client, adapter } = setup({
      users: [{ email: 'new@x.co', password: 'pw', emailVerified: false }],
    })
    const onSuccess = vi.fn()
    renderWithAuth(<SignInForm onSuccess={onSuccess} />, client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), 'new@x.co')
    await user().type(screen.getByLabelText(/^Password/), 'pw')
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    await typeCode(adapter.lastCode('new@x.co') as string)
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('sends a magic link instead of using a password', async () => {
    const { client, adapter } = setup()
    renderWithAuth(<SignInForm />, client)
    await user().click(
      await screen.findByRole('button', { name: 'Email me a sign-in link instead' }),
    )
    expect(screen.queryByLabelText(/^Password/)).not.toBeInTheDocument()
    await user().type(screen.getByRole('textbox', { name: /email/i }), ada.email)
    await user().click(screen.getByRole('button', { name: 'Email me a sign-in link' }))
    expect(await screen.findByText(/We sent a sign-in link to/)).toBeInTheDocument()
    expect(adapter.lastCode(ada.email, 'magic-link')).toBeTruthy()
    await user().click(screen.getByRole('button', { name: 'Use a different email' }))
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('offers the adapter’s OAuth providers and hides them when asked', async () => {
    const { client } = setup()
    const onSuccess = vi.fn()
    const { unmount } = renderWithAuth(<SignInForm onSuccess={onSuccess} />, client)
    await user().click(await screen.findByRole('button', { name: 'Continue with GitHub' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    unmount()
    renderWithAuth(<SignInForm providers={[]} magicLink={false} />, client)
    await screen.findByRole('button', { name: 'Sign in' })
    expect(screen.queryByRole('button', { name: /Continue with/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign-in link/ })).not.toBeInTheDocument()
  })
})

describe('SignUpForm', () => {
  it('creates the account, verifies the email and signs in', async () => {
    const { client, adapter } = setup()
    const onSuccess = vi.fn()
    renderWithAuth(
      <SignUpForm onSuccess={onSuccess} signInHref="/sign-in" terms="By signing up you agree." />,
      client,
    )
    await user().click(await screen.findByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Enter your name.')).toBeInTheDocument()
    await user().type(screen.getByRole('textbox', { name: /name/i }), 'Alan Turing')
    await user().type(screen.getByRole('textbox', { name: /email/i }), 'alan@example.com')
    await user().type(screen.getByLabelText(/^Password/), 'short')
    await user().click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText('Use at least 8 characters.')).toBeInTheDocument()
    await user().type(screen.getByLabelText(/^Password/), ' but longer')
    await user().click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    await typeCode(adapter.lastCode('alan@example.com') as string)
    await waitFor(() =>
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ user: expect.objectContaining({ name: 'Alan Turing' }) }),
      ),
    )
  })

  it('shows "email taken" on the email field', async () => {
    const { client } = setup()
    renderWithAuth(<SignUpForm collectName={false} />, client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), ada.email)
    await user().type(screen.getByLabelText(/^Password/), 'long enough pw')
    await user().click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByText(/already exists/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows an inbox notice for link-based verification', async () => {
    const { client } = setup()
    Object.assign(client.capabilities, { emailCode: false })
    renderWithAuth(<SignUpForm collectName={false} signInHref="/sign-in" />, client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), 'link@x.co')
    await user().type(screen.getByLabelText(/^Password/), 'long enough pw')
    await user().click(screen.getByRole('button', { name: 'Create account' }))
    expect(await screen.findByRole('heading', { name: 'Confirm your email' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to sign in' })).toHaveAttribute('href', '/sign-in')
  })
})

describe('password reset', () => {
  it('confirms without revealing whether the account exists', async () => {
    const { client } = setup()
    renderWithAuth(<ForgotPasswordForm signInHref="/sign-in" />, client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), 'nobody@x.co')
    await user().click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByText(/If an account exists for nobody@x.co/)).toBeInTheDocument()
    await user().click(screen.getByRole('button', { name: 'Use a different email' }))
    expect(await screen.findByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })

  it('sets a new password from the link token', async () => {
    const { client, adapter } = setup()
    await client.requestPasswordReset(ada.email)
    const token = adapter.lastCode(ada.email, 'reset-password') as string
    const onSuccess = vi.fn()
    renderWithAuth(
      <ResetPasswordForm token={token} signInHref="/sign-in" onSuccess={onSuccess} />,
      client,
    )
    await user().type(await screen.findByLabelText(/^New password/), 'brand new pw')
    await user().type(screen.getByLabelText(/^Repeat new password/), 'different')
    await user().click(screen.getByRole('button', { name: 'Update password' }))
    expect(await screen.findByText('The passwords don’t match.')).toBeInTheDocument()
    await user().clear(screen.getByLabelText(/^Repeat new password/))
    await user().type(screen.getByLabelText(/^Repeat new password/), 'brand new pw')
    await user().click(screen.getByRole('button', { name: 'Update password' }))
    expect(await screen.findByRole('heading', { name: 'Password updated' })).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in')
    await expect(
      client.signIn({ email: ada.email, password: 'brand new pw' }),
    ).resolves.toMatchObject({ status: 'signed-in' })
  })

  it('reports an expired token above the form', async () => {
    const { client } = setup()
    renderWithAuth(<ResetPasswordForm token="stale" />, client)
    await user().type(await screen.findByLabelText(/^New password/), 'brand new pw')
    await user().type(screen.getByLabelText(/^Repeat new password/), 'brand new pw')
    await user().click(screen.getByRole('button', { name: 'Update password' }))
    expect(await screen.findByText(/reset link has expired/)).toBeInTheDocument()
  })

  it('continues to a code field for code-based backends', async () => {
    const { client } = setup()
    Object.assign(client.capabilities, { passwordResetMethod: 'code' })
    const resetPassword = vi.spyOn(client, 'resetPassword').mockResolvedValue()
    renderWithAuth(<ForgotPasswordForm />, client)
    await user().type(await screen.findByRole('textbox', { name: /email/i }), ada.email)
    await user().click(screen.getByRole('button', { name: 'Send reset link' }))
    expect(await screen.findByText(/Enter the code we sent to/)).toBeInTheDocument()
    await typeCode('123456')
    await user().type(screen.getByLabelText(/^New password/), 'brand new pw')
    await user().type(screen.getByLabelText(/^Repeat new password/), 'brand new pw')
    await user().click(screen.getByRole('button', { name: 'Update password' }))
    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({ token: '123456', password: 'brand new pw' }),
    )
  })
})

describe('code screens', () => {
  it('resends the verification code with a cooldown', async () => {
    const { client } = setup({ users: [{ email: 'v@x.co', password: 'p', emailVerified: false }] })
    const resend = vi.spyOn(client, 'resendVerification')
    const onBack = vi.fn()
    renderWithAuth(<VerifyEmailForm email="v@x.co" onBack={onBack} />, client)
    await user().click(await screen.findByRole('button', { name: 'resend the code' }))
    expect(resend).toHaveBeenCalledWith('v@x.co')
    expect(screen.getByRole('button', { name: /resend in \d+s/ })).toBeDisabled()
    await user().click(screen.getByRole('button', { name: 'Use a different email' }))
    expect(onBack).toHaveBeenCalled()
  })

  it('requires all six digits', async () => {
    const { client } = setup()
    renderWithAuth(<TwoFactorForm onBack={() => {}} />, client)
    await typeCode('12')
    await user().click(screen.getByRole('button', { name: 'Verify' }))
    expect(await screen.findByText('Enter the 6-digit code.')).toBeInTheDocument()
  })

  it('resends a magic link', async () => {
    const { client } = setup()
    const signIn = vi.spyOn(client, 'signIn')
    renderWithAuth(<MagicLinkSent email={ada.email} />, client)
    await user().click(await screen.findByRole('button', { name: 'Resend link' }))
    expect(signIn).toHaveBeenCalledWith({ email: ada.email, magicLink: true })
    await act(async () => {})
  })
})
