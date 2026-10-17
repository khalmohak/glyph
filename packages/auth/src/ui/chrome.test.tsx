import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthError } from '../core/errors'
import { ada, renderWithAuth, setup } from '../test/render'
import { AuthLayout } from './auth-layout'
import { OrganizationSwitcher } from './organization-switcher'
import { IdleWarningDialog, SessionExpiredDialog } from './session-dialogs'
import { AuthNotice } from './shared'
import { SocialButtons } from './social-buttons'
import { UserMenu } from './user-menu'

const user = () => userEvent.setup()

async function signedIn() {
  const ctx = setup()
  await ctx.client.signIn({ email: ada.email, password: ada.password })
  return ctx
}

describe('UserMenu', () => {
  it('shows the user, links, theme and signs out', async () => {
    const { client } = await signedIn()
    const onSignOut = vi.fn()
    const onSelect = vi.fn()
    renderWithAuth(
      <UserMenu
        items={[
          { label: 'Settings', href: '/settings', icon: <svg /> },
          { label: 'Invite people', onSelect },
        ]}
        onSignOut={onSignOut}
      />,
      client,
    )
    const trigger = await screen.findByRole('button', { name: /Ada Lovelace/ })
    await user().click(trigger)
    expect(await screen.findByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/settings',
    )
    await user().click(screen.getByRole('menuitem', { name: 'Invite people' }))
    expect(onSelect).toHaveBeenCalled()
    await user().click(trigger)
    await user().click(await screen.findByRole('menuitem', { name: 'Sign out' }))
    await waitFor(() => expect(onSignOut).toHaveBeenCalled())
    expect(client.getState().status).toBe('unauthenticated')
  })

  it('renders nothing when signed out, and an avatar-only trigger when compact', async () => {
    const { client } = setup()
    const { container, unmount } = renderWithAuth(<UserMenu />, client)
    await waitFor(() => expect(client.getState().status).toBe('unauthenticated'))
    expect(container.querySelector('[data-slot="user-menu"]')).toBeNull()
    unmount()
    await client.signIn({ email: ada.email, password: ada.password })
    renderWithAuth(<UserMenu compact colorMode={false} />, client)
    expect(
      await screen.findByRole('button', { name: 'Account menu for Ada Lovelace' }),
    ).toBeInTheDocument()
  })
})

describe('OrganizationSwitcher', () => {
  it('switches the active organization', async () => {
    const { client } = await signedIn()
    const onSwitch = vi.fn()
    const onCreate = vi.fn()
    renderWithAuth(<OrganizationSwitcher onSwitch={onSwitch} onCreate={onCreate} />, client)
    await user().click(await screen.findByRole('button', { name: /Analytical Engines/ }))
    await user().click(await screen.findByRole('menuitemradio', { name: /Difference Ltd/ }))
    await waitFor(() =>
      expect(onSwitch).toHaveBeenCalledWith(expect.objectContaining({ id: 'org_2' })),
    )
    expect(client.getState().session?.activeOrganizationId).toBe('org_2')
    await user().click(screen.getByRole('button', { name: /Difference Ltd/ }))
    await user().click(await screen.findByRole('menuitem', { name: 'Create organization' }))
    expect(onCreate).toHaveBeenCalled()
  })

  it('renders nothing without organizations', async () => {
    const { client } = setup({ users: [{ email: 'solo@x.co', password: 'p' }] })
    await client.signIn({ email: 'solo@x.co', password: 'p' })
    const { container } = renderWithAuth(<OrganizationSwitcher />, client)
    expect(container.querySelector('[data-slot="organization-switcher"]')).toBeNull()
  })
})

describe('SessionExpiredDialog', () => {
  it('lets the user sign back in without leaving the page', async () => {
    const { client } = await signedIn()
    renderWithAuth(<SessionExpiredDialog />, client)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => client.markExpired())
    const dialog = await screen.findByRole('dialog', { name: 'Your session expired' })
    expect(dialog).toHaveTextContent(ada.email)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('Enter your password.')).toBeInTheDocument()
    await user().type(screen.getByLabelText('Password'), 'wrong')
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText('That email and password don’t match.')).toBeInTheDocument()
    await user().clear(screen.getByLabelText('Password'))
    await user().type(screen.getByLabelText('Password'), ada.password)
    await user().click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(client.getState().expired).toBe(false))
  })

  it('signs out instead', async () => {
    const { client } = await signedIn()
    const onSignOut = vi.fn()
    renderWithAuth(<SessionExpiredDialog onSignOut={onSignOut} />, client)
    act(() => client.markExpired())
    await user().click(await screen.findByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(onSignOut).toHaveBeenCalled())
  })
})

describe('IdleWarningDialog', () => {
  it('stays closed while the user is active', async () => {
    const { client } = await signedIn()
    renderWithAuth(<IdleWarningDialog />, client)
    await waitFor(() => expect(client.getState().status).toBe('authenticated'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the warning from the client state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const ctx = setup({}, { idleTimeout: 5_000, idleWarning: 4_000, refreshInterval: false })
    await ctx.client.signIn({ email: ada.email, password: ada.password })
    const onSignOut = vi.fn()
    renderWithAuth(<IdleWarningDialog onSignOut={onSignOut} />, ctx.client)
    await act(() => vi.advanceTimersByTimeAsync(1_200))
    expect(await screen.findByRole('dialog', { name: 'Still there?' })).toHaveTextContent(/seconds/)
    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime })
      .click(screen.getByRole('button', { name: 'Stay signed in' }))
    await waitFor(() => expect(ctx.client.getState().idleDeadline).toBeNull())
    await act(() => vi.advanceTimersByTimeAsync(1_200))
    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime })
      .click(await screen.findByRole('button', { name: 'Sign out' }))
    await waitFor(() => expect(onSignOut).toHaveBeenCalled())
    vi.useRealTimers()
  })
})

describe('SocialButtons', () => {
  it('shows provider errors and side-by-side layout', async () => {
    const { client } = setup({
      fail: (op) => (op === 'signIn' ? new AuthError('Popup blocked.') : undefined),
    })
    renderWithAuth(
      <SocialButtons layout="row" providers={['google', 'microsoft', 'okta']} />,
      client,
    )
    await user().click(await screen.findByRole('button', { name: 'Google' }))
    expect(await screen.findByText('Popup blocked.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Okta' })).toBeInTheDocument()
  })

  it('renders nothing without providers', async () => {
    const { client } = setup({ oauthProviders: [] })
    const { container } = renderWithAuth(<SocialButtons />, client)
    expect(container.querySelector('[data-slot="social-buttons"]')).toBeNull()
  })
})

describe('AuthLayout and AuthNotice', () => {
  it('renders brand, content, aside and footer landmarks', async () => {
    const { client } = setup()
    renderWithAuth(
      <AuthLayout brand="Acme" aside={<p>Loved by teams</p>} footer="© Acme" side="left">
        <AuthNotice title="Done" headingLevel={2} actions={<button type="button">ok</button>}>
          All set.
        </AuthNotice>
      </AuthLayout>,
      client,
    )
    expect(screen.getByRole('main')).toHaveTextContent('All set.')
    expect(screen.getByRole('complementary')).toHaveTextContent('Loved by teams')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© Acme')
    expect(screen.getByRole('heading', { level: 2, name: 'Done' })).toBeInTheDocument()
  })

  it('renders a notice without body as a heading only', async () => {
    const { client } = setup()
    renderWithAuth(<AuthNotice title="Signed out" />, client)
    expect(screen.getByRole('heading', { name: 'Signed out' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})
