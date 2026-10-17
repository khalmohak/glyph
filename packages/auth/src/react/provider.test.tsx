import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { memoryAdapter } from '../adapters/memory'
import { ada, Providers, setup } from '../test/render'
import { AuthProvider, Can, useAuth, useCan, useHasRole, useSession, useUser } from './provider'

describe('AuthProvider', () => {
  it('creates a client from an adapter and loads the session', async () => {
    function Status() {
      const { status, isLoading, isAuthenticated } = useAuth()
      return <p>{`${status} ${isLoading} ${isAuthenticated}`}</p>
    }
    render(
      <AuthProvider adapter={memoryAdapter({ latency: 0 })} syncTabs={false}>
        <Status />
      </AuthProvider>,
    )
    expect(screen.getByText('loading true false')).toBeInTheDocument()
    expect(await screen.findByText('unauthenticated false false')).toBeInTheDocument()
  })

  it('throws a clear error outside the provider', () => {
    expect(() => renderHook(useAuth)).toThrow('useAuth must be used inside <AuthProvider>.')
  })

  it('exposes the user, session, permissions and roles', async () => {
    const { client } = setup()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Providers client={client}>{children}</Providers>
    )
    const { result } = renderHook(
      () => ({
        auth: useAuth(),
        user: useUser(),
        session: useSession(),
        canWrite: useCan('invoices:write'),
        isAdmin: useHasRole('admin'),
      }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.auth.status).toBe('unauthenticated'))
    expect(result.current.canWrite).toBe(false)
    await act(() => result.current.auth.signIn({ email: ada.email, password: ada.password }))
    expect(result.current.user).toMatchObject({ email: ada.email })
    expect(result.current.session?.roles).toEqual(['admin'])
    expect(result.current.canWrite).toBe(true)
    expect(result.current.isAdmin).toBe(true)
    expect(result.current.auth.can('billing:x')).toBe(false)
    expect(result.current.auth.hasRole('admin')).toBe(true)
  })

  it('Can renders children only when allowed', async () => {
    const { client } = setup()
    render(
      <Providers client={client}>
        <Can permission="invoices:delete" fallback={<p>no</p>}>
          <p>delete</p>
        </Can>
        <Can roles="owner">
          <p>owner tools</p>
        </Can>
      </Providers>,
    )
    expect(await screen.findByText('no')).toBeInTheDocument()
    await act(() => client.signIn({ email: ada.email, password: ada.password }))
    expect(screen.getByText('delete')).toBeInTheDocument()
    expect(screen.queryByText('owner tools')).not.toBeInTheDocument()
  })
})
