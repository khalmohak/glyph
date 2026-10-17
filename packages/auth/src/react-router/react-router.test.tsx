import { GlyphProvider } from '@glyphui/ui'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import type { AuthClient } from '../core/client'
import { AuthProvider } from '../react/provider'
import { ada, setup } from '../test/render'
import {
  GuestOnly,
  guestLoader,
  protectedLoader,
  RequireAuth,
  RequireRole,
  useRedirectAfterSignIn,
} from './index'

function Where() {
  const location = useLocation()
  return <p data-testid="where">{`${location.pathname}${location.search}`}</p>
}

function SignInPage() {
  const go = useRedirectAfterSignIn('/home')
  return (
    <>
      <Where />
      <button type="button" onClick={go}>
        continue
      </button>
    </>
  )
}

function app(client: AuthClient, initial: string) {
  return render(
    <GlyphProvider storageKey={null} motion="none">
      <AuthProvider client={client}>
        <MemoryRouter initialEntries={[initial]}>
          <Routes>
            <Route element={<GuestOnly redirectTo="/home" />}>
              <Route path="/sign-in" element={<SignInPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/home" element={<p>home</p>} />
              <Route path="/invoices" element={<p>invoices</p>} />
              <Route path="/billing" element={<RequireRole permission="billing:manage" />}>
                <Route index element={<p>billing</p>} />
              </Route>
              <Route
                path="/admin"
                element={
                  <RequireRole roles="admin" fallback={<p>admins only</p>}>
                    <p>admin panel</p>
                  </RequireRole>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </GlyphProvider>,
  )
}

describe('React Router guards', () => {
  it('sends signed-out users to sign in, remembering where they were going', async () => {
    const { client } = setup()
    app(client, '/invoices?page=2')
    expect(screen.getByRole('status')).toHaveTextContent('Checking your session')
    expect(await screen.findByTestId('where')).toHaveTextContent(
      '/sign-in?next=%2Finvoices%3Fpage%3D2',
    )
  })

  it('returns to the deep link after signing in', async () => {
    const { client } = setup()
    app(client, '/invoices?page=2')
    await screen.findByTestId('where')
    await act(() => client.signIn({ email: ada.email, password: ada.password }))
    // GuestOnly follows ?next= as soon as the session exists.
    expect(await screen.findByText('invoices')).toBeInTheDocument()
  })

  it('never follows an off-site next', async () => {
    const { client } = setup()
    app(client, '/sign-in?next=https%3A%2F%2Fevil.com')
    await screen.findByTestId('where')
    await act(() => client.signIn({ email: ada.email, password: ada.password }))
    expect(await screen.findByText('home')).toBeInTheDocument()
  })

  it('useRedirectAfterSignIn follows only safe paths', async () => {
    const { client } = setup()
    render(
      <GlyphProvider storageKey={null} motion="none">
        <AuthProvider client={client}>
          <MemoryRouter initialEntries={['/sign-in?next=%2F%2Fevil.com']}>
            <Routes>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/home" element={<Where />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </GlyphProvider>,
    )
    await userEvent.click(await screen.findByRole('button', { name: 'continue' }))
    expect(screen.getByTestId('where')).toHaveTextContent('/home')
  })

  it('shows role and permission fallbacks', async () => {
    const { client } = setup()
    await client.signIn({ email: 'grace@example.com', password: 'cobol rules' }).catch(() => {})
    await client.signIn({ email: ada.email, password: ada.password })
    const { unmount } = app(client, '/admin')
    expect(await screen.findByText('admin panel')).toBeInTheDocument()
    unmount()
    app(client, '/billing')
    expect(await screen.findByText('You don’t have access to this page')).toBeInTheDocument()
  })

  it('uses the custom fallback for missing roles', async () => {
    const { client, adapter } = setup()
    await adapter.signUp?.({ email: 'm@x.co', password: 'longpassword' })
    const code = adapter.lastCode('m@x.co') as string
    await client.verifyEmail({ email: 'm@x.co', code })
    app(client, '/admin')
    expect(await screen.findByText('admins only')).toBeInTheDocument()
  })
})

describe('data router loaders', () => {
  // jsdom's AbortSignal can't drive a data router, so the loaders are called directly.
  const args = (url: string) =>
    ({ request: new Request(`https://app.test${url}`), params: {}, context: undefined }) as never

  async function redirectOf(promise: Promise<unknown>): Promise<string | null> {
    try {
      await promise
      return null
    } catch (thrown) {
      return (thrown as Response).headers.get('Location')
    }
  }

  it('redirects to sign in before rendering when signed out', async () => {
    const { client } = setup()
    const loader = protectedLoader(client, () => ({ count: 3 }), { redirectTo: '/login' })
    expect(await redirectOf(Promise.resolve(loader(args('/invoices?tab=open'))))).toBe(
      '/login?next=%2Finvoices%3Ftab%3Dopen',
    )
    expect(await redirectOf(Promise.resolve(protectedLoader(client)(args('/home'))))).toBe(
      '/sign-in?next=%2Fhome',
    )
  })

  it('leaves the router basename out of next', async () => {
    const { client } = setup()
    const loader = protectedLoader(client, undefined, { basename: '/acme/' })
    expect(await redirectOf(Promise.resolve(loader(args('/acme/app?x=1'))))).toBe(
      '/sign-in?next=%2Fapp%3Fx%3D1',
    )
    expect(await redirectOf(Promise.resolve(loader(args('/acme'))))).toBe('/sign-in')
    expect(await redirectOf(Promise.resolve(loader(args('/elsewhere'))))).toBe(
      '/sign-in?next=%2Felsewhere',
    )
  })

  it('runs the wrapped loader when signed in', async () => {
    const { client } = setup()
    await client.signIn({ email: ada.email, password: ada.password })
    expect(await protectedLoader(client, () => ({ count: 3 }))(args('/invoices'))).toEqual({
      count: 3,
    })
    expect(await protectedLoader(client)(args('/invoices'))).toBeNull()
  })

  it('sends signed-in users past guest pages, to a safe next only', async () => {
    const { client } = setup()
    expect(await guestLoader(client)(args('/sign-in'))).toBeNull()
    await client.signIn({ email: ada.email, password: ada.password })
    const loader = guestLoader(client, { redirectTo: '/home' })
    expect(await redirectOf(Promise.resolve(loader(args('/sign-in?next=%2Finvoices'))))).toBe(
      '/invoices',
    )
    expect(
      await redirectOf(Promise.resolve(loader(args('/sign-in?next=https%3A%2F%2Fevil.com')))),
    ).toBe('/home')
  })
})
