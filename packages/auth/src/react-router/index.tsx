import { EmptyState, LoadingState } from '@glyphui/ui'
import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import {
  type LoaderFunction,
  type LoaderFunctionArgs,
  Navigate,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from 'react-router'
import type { AuthClient } from '../core/client'
import { NEXT_PARAM, safeRedirectPath, signInPathFor } from '../core/redirect'
import { useAuth } from '../react/provider'

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

const defaultLoading = <LoadingState label="Checking your session…" className="min-h-48" />

export interface RequireAuthProps {
  /** Where signed-out users go. The current path is added as `?next=`. Default `/sign-in`. */
  redirectTo?: string
  /** Shown while the session loads. */
  loading?: ReactNode
  /** The protected content. Default `<Outlet />`, so it works as a layout route. */
  children?: ReactNode
}

/**
 * Renders its children only for signed-in users; everyone else goes to the sign-in page and
 * comes back afterwards. Use it as a layout route (`element={<RequireAuth />}`) or around
 * an element.
 */
export function RequireAuth({
  redirectTo = '/sign-in',
  loading = defaultLoading,
  children,
}: RequireAuthProps) {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <>{loading}</>
  if (status === 'unauthenticated') {
    const here = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={signInPathFor(redirectTo, here)} replace />
  }
  return <>{children ?? <Outlet />}</>
}

export interface GuestOnlyProps {
  /** Where signed-in users go when there's no safe `?next=`. Default `/`. */
  redirectTo?: string
  loading?: ReactNode
  children?: ReactNode
}

/** For sign-in and sign-up pages: signed-in users skip them and continue where they were going. */
export function GuestOnly({
  redirectTo = '/',
  loading = defaultLoading,
  children,
}: GuestOnlyProps) {
  const { status } = useAuth()
  const [params] = useSearchParams()
  if (status === 'loading') return <>{loading}</>
  if (status === 'authenticated')
    return <Navigate to={safeRedirectPath(params.get(NEXT_PARAM), redirectTo)} replace />
  return <>{children ?? <Outlet />}</>
}

export interface RequireRoleProps {
  /** Required role, or any of several. (Named `roles` so linters don't read it as an ARIA role.) */
  roles?: string | readonly string[]
  /** Required permission, e.g. `billing:manage`. */
  permission?: string
  /** Shown to signed-in users without access. Default a "no access" message. */
  fallback?: ReactNode
  loading?: ReactNode
  children?: ReactNode
}

/**
 * Renders its children only for users with the role or permission; others see `fallback`.
 * Put it inside `RequireAuth`. Your API must enforce the same rule; this only shapes the UI.
 */
export function RequireRole({
  roles,
  permission,
  fallback,
  loading = defaultLoading,
  children,
}: RequireRoleProps) {
  const auth = useAuth()
  if (auth.status === 'loading') return <>{loading}</>
  const allowed =
    auth.status === 'authenticated' &&
    (roles === undefined || auth.hasRole(roles)) &&
    (permission === undefined || auth.can(permission))
  if (allowed) return <>{children ?? <Outlet />}</>
  return (
    <>
      {fallback ?? (
        <EmptyState
          icon={<LockIcon />}
          title="You don’t have access to this page"
          description="Ask a workspace admin for access."
        />
      )}
    </>
  )
}

export interface LoaderAuthOptions {
  /** Where signed-out users go. Default `/sign-in`. */
  redirectTo?: string
  /**
   * Your router's `basename`, if it has one. Loaders see full URLs, so it is removed from
   * the remembered `?next=` path (React Router adds it back when navigating).
   */
  basename?: string
}

/** The request's path and query, relative to the router's basename. */
function appPath(request: Request, basename = '/'): string {
  const url = new URL(request.url)
  const base = basename.replace(/\/$/, '')
  const path =
    base && (url.pathname === base || url.pathname.startsWith(`${base}/`))
      ? url.pathname.slice(base.length) || '/'
      : url.pathname
  return `${path}${url.search}`
}

/**
 * Wraps a data-router loader so signed-out users are redirected before anything renders
 * or fetches. The client must be the one passed to `AuthProvider`.
 *
 * ```ts
 * { path: 'invoices', loader: protectedLoader(auth, () => api.invoices()), element: <Invoices /> }
 * ```
 */
export function protectedLoader<T = null>(
  client: AuthClient,
  loader?: (args: LoaderFunctionArgs) => T | Promise<T>,
  { redirectTo = '/sign-in', basename }: LoaderAuthOptions = {},
): LoaderFunction {
  return async (args) => {
    const state = await client.ready()
    if (state.status !== 'authenticated')
      throw redirect(signInPathFor(redirectTo, appPath(args.request, basename)))
    return loader ? loader(args) : null
  }
}

/** A loader for sign-in and sign-up routes: signed-in users continue to `?next=` or `redirectTo`. */
export function guestLoader(
  client: AuthClient,
  { redirectTo = '/' }: { redirectTo?: string } = {},
): LoaderFunction {
  return async ({ request }) => {
    const state = await client.ready()
    if (state.status === 'authenticated') {
      const next = new URL(request.url).searchParams.get(NEXT_PARAM)
      throw redirect(safeRedirectPath(next, redirectTo))
    }
    return null
  }
}

/**
 * Returns a function that sends the user where they were going before sign-in (the
 * `?next=` param), or to `fallback`. Only same-origin paths are followed.
 *
 * ```tsx
 * const continueToApp = useRedirectAfterSignIn('/app')
 * <SignInForm onSuccess={continueToApp} />
 * ```
 */
export function useRedirectAfterSignIn(fallback = '/'): () => void {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  return useCallback(() => {
    navigate(safeRedirectPath(params.get(NEXT_PARAM), fallback), { replace: true })
  }, [navigate, params, fallback])
}

export { NEXT_PARAM, safeRedirectPath, signInPathFor }

/**
 * Re-runs the route loaders whenever the user signs in or out, including when the idle
 * timer, another tab or the server ends the session. Routes guarded only by
 * `protectedLoader` then send the user to sign-in instead of leaving a dead page on screen,
 * and `guestLoader` pages move on after signing in. Data routers only (`createBrowserRouter`).
 *
 * Call it once in a component that renders inside the router, such as your root layout.
 */
export function useAuthRevalidation(): void {
  const { status } = useAuth()
  const { revalidate } = useRevalidator()
  const previous = useRef(status)
  useEffect(() => {
    const before = previous.current
    previous.current = status
    // The first load isn't a change: loaders already ran with the right session.
    if (before !== status && before !== 'loading') void revalidate()
  }, [status, revalidate])
}

/** `useAuthRevalidation` as a component, for your root route's element. */
export function AuthRevalidator(): null {
  useAuthRevalidation()
  return null
}
