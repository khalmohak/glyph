import { GlyphProvider } from '@glyphui/ui'
import { act, render, screen } from '@testing-library/react'
import { createMemoryRouter, Outlet, RouterProvider, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../react/provider'
import { ada, setup } from '../test/render'
import { AuthRevalidator, protectedLoader } from './index'

function Where() {
  const location = useLocation()
  return <p data-testid="where">{`${location.pathname}${location.search}`}</p>
}

// Data routers build a Request with jsdom's AbortSignal, which Node's Request rejects. The
// loaders here don't read the signal, so drop it.
beforeEach(() => {
  const NodeRequest = globalThis.Request
  class SignalFreeRequest extends NodeRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      const { signal: _signal, ...rest } = init ?? {}
      super(input, rest)
    }
  }
  vi.stubGlobal('Request', SignalFreeRequest)
})
afterEach(() => vi.unstubAllGlobals())

// Relay finding A9: apps that guard routes only with loaders stayed on protected pages after
// the idle timer, another tab or the server signed the user out.
describe('AuthRevalidator', () => {
  it('re-runs loaders after a sign-out elsewhere, so protected pages redirect', async () => {
    const { client } = setup()
    await client.signIn({ email: ada.email, password: ada.password })
    const router = createMemoryRouter(
      [
        {
          element: (
            <>
              <AuthRevalidator />
              <Outlet />
            </>
          ),
          children: [
            { path: 'sign-in', element: <Where /> },
            { path: 'invoices', loader: protectedLoader(client), element: <Where /> },
          ],
        },
      ],
      { initialEntries: ['/invoices?page=2'] },
    )
    render(
      <GlyphProvider storageKey={null} motion="none">
        <AuthProvider client={client}>
          <RouterProvider router={router} />
        </AuthProvider>
      </GlyphProvider>,
    )
    expect(await screen.findByText('/invoices?page=2')).toBeInTheDocument()
    await act(() => client.signOut({ reason: 'remote' }))
    expect(
      await screen.findByText(`/sign-in?next=${encodeURIComponent('/invoices?page=2')}`),
    ).toBeInTheDocument()
  })
})
