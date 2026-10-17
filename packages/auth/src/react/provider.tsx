import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  type AuthClient,
  type AuthClientOptions,
  type AuthState,
  createAuthClient,
} from '../core/client'
import type { AuthAdapter, AuthSession, AuthUser } from '../core/types'

const AuthContext = createContext<AuthClient | null>(null)

export type AuthProviderProps = AuthClientOptions & {
  children: ReactNode
} & (
    | {
        /** A client from `createAuthClient`, shared with route loaders. */
        client: AuthClient
        adapter?: never
      }
    | {
        /** An adapter; the provider creates the client. Use `client` when loaders need it. */
        adapter: AuthAdapter
        client?: never
      }
  )

/**
 * Provides the session to everything inside: `useAuth()`, guards, and the auth screens.
 * Render once near the root, inside `GlyphProvider`.
 */
export function AuthProvider({ children, client: given, adapter, ...options }: AuthProviderProps) {
  // The client is created once; later adapter or option changes are ignored by design.
  const [client] = useState(() => given ?? createAuthClient(adapter as AuthAdapter, options))
  useEffect(() => client.start(), [client])
  return <AuthContext.Provider value={client}>{children}</AuthContext.Provider>
}

/** The auth client from the nearest `AuthProvider`. */
export function useAuthClient(): AuthClient {
  const client = useContext(AuthContext)
  if (!client) throw new Error('useAuth must be used inside <AuthProvider>.')
  return client
}

function useAuthState(): AuthState {
  const client = useAuthClient()
  return useSyncExternalStore(client.subscribe, client.getState, client.getState)
}

export type UseAuthResult = AuthState &
  Pick<
    AuthClient,
    | 'capabilities'
    | 'signIn'
    | 'signUp'
    | 'signOut'
    | 'refresh'
    | 'requestPasswordReset'
    | 'resetPassword'
    | 'verifyEmail'
    | 'resendVerification'
    | 'verifySecondFactor'
    | 'switchOrganization'
    | 'updateUser'
    | 'fetch'
    | 'keepAlive'
    | 'can'
    | 'hasRole'
  > & {
    isAuthenticated: boolean
    isLoading: boolean
    client: AuthClient
  }

/**
 * The session and every auth action:
 *
 * ```tsx
 * const { user, status, signOut } = useAuth()
 * ```
 */
export function useAuth(): UseAuthResult {
  const client = useAuthClient()
  const state = useAuthState()
  return useMemo(
    () => ({
      ...state,
      isAuthenticated: state.status === 'authenticated',
      isLoading: state.status === 'loading',
      client,
      capabilities: client.capabilities,
      signIn: client.signIn,
      signUp: client.signUp,
      signOut: client.signOut,
      refresh: client.refresh,
      requestPasswordReset: client.requestPasswordReset,
      resetPassword: client.resetPassword,
      verifyEmail: client.verifyEmail,
      resendVerification: client.resendVerification,
      verifySecondFactor: client.verifySecondFactor,
      switchOrganization: client.switchOrganization,
      updateUser: client.updateUser,
      fetch: client.fetch,
      keepAlive: client.keepAlive,
      // Bound to this render's session so components re-render when permissions change.
      can: (permission: string) => client.can(permission),
      hasRole: (role: string | readonly string[]) => client.hasRole(role),
    }),
    [client, state],
  )
}

/** The signed-in user, or null. */
export function useUser(): AuthUser | null {
  return useAuthState().user
}

/** The current session, or null. */
export function useSession(): AuthSession | null {
  return useAuthState().session
}

/** Whether the current session grants `permission` (`invoices:write`, wildcards allowed). */
export function useCan(permission: string): boolean {
  const client = useAuthClient()
  useAuthState()
  return client.can(permission)
}

/** Whether the current session has any of the roles. */
export function useHasRole(role: string | readonly string[]): boolean {
  const client = useAuthClient()
  useAuthState()
  return client.hasRole(role)
}

export interface CanProps {
  /** Required permission, e.g. `billing:manage`. */
  permission?: string
  /** Required role, or any of several. (Named `roles` so linters don't read it as an ARIA role.) */
  roles?: string | readonly string[]
  /** Rendered when the check fails. Default nothing. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Renders its children only for users who have the permission and/or role. Hiding UI is a
 * convenience, not security: your API must check permissions too.
 */
export function Can({ permission, roles, fallback = null, children }: CanProps) {
  const client = useAuthClient()
  const state = useAuthState()
  const allowed =
    state.status === 'authenticated' &&
    (permission === undefined || client.can(permission)) &&
    (roles === undefined || client.hasRole(roles))
  return <>{allowed ? children : fallback}</>
}
