import { AuthError, isAuthError, notSupported } from './errors'
import { can, hasRole } from './permissions'
import type {
  AuthAdapter,
  AuthCapabilities,
  AuthSession,
  AuthStatus,
  AuthUser,
  SignInInput,
  SignInResult,
  SignUpInput,
} from './types'

export type SignOutReason = 'user' | 'idle' | 'expired' | 'remote'

export interface AuthState {
  status: AuthStatus
  session: AuthSession | null
  user: AuthUser | null
  /** The last error from loading or refreshing the session. Actions throw instead. */
  error: AuthError | null
  /**
   * The server stopped accepting the session while the app still showed it. The user stays
   * on the page (no lost work) until they sign in again or sign out; `SessionExpiredDialog`
   * asks them to.
   */
  expired: boolean
  /** When the idle timer will sign the user out (ms timestamp), while its warning shows. */
  idleDeadline: number | null
}

export interface AuthClientOptions {
  /** Re-check the session this often while the tab is open. Default 5 minutes; `false` to disable. */
  refreshInterval?: number | false
  /** Re-check the session when the tab regains focus. Default true. */
  refreshOnFocus?: boolean
  /**
   * Keep tabs in sync: signing in or out in one tab updates the others. Pass a string to
   * name the channel (useful when two apps share an origin). Default true.
   */
  syncTabs?: boolean | string
  /** Sign the user out after this long without activity (ms). Off by default. */
  idleTimeout?: number
  /** How long before the idle sign-out to warn (ms). Default 60 seconds. */
  idleWarning?: number
  /** Called after any sign-out, with why it happened. */
  onSignOut?: (reason: SignOutReason) => void
}

export interface AuthClient {
  readonly adapter: AuthAdapter
  readonly capabilities: AuthCapabilities
  getState(): AuthState
  /** For `useSyncExternalStore`: called after every state change. */
  subscribe(listener: () => void): () => void
  /** Loads the session if it hasn't been yet, and resolves once the status is known. */
  ready(): Promise<AuthState>
  /** Re-reads the session from the adapter. */
  load(): Promise<AuthState>
  /** Attaches focus, interval, cross-tab and idle listeners. Returns a stop function. */
  start(): () => void
  signIn(input: SignInInput): Promise<SignInResult>
  signUp(input: SignUpInput): Promise<SignInResult>
  signOut(options?: { reason?: SignOutReason }): Promise<void>
  refresh(): Promise<AuthSession | null>
  requestPasswordReset(email: string): Promise<void>
  resetPassword(input: {
    token: string
    password: string
    email?: string | undefined
  }): Promise<void>
  verifyEmail(input: { email: string; code: string }): Promise<SignInResult>
  resendVerification(email: string): Promise<void>
  verifySecondFactor(input: { code: string }): Promise<SignInResult>
  switchOrganization(organizationId: string): Promise<AuthSession>
  updateUser(patch: Partial<AuthUser>): Promise<AuthSession>
  /**
   * `fetch` with the session attached. On a 401 it refreshes the session once and retries;
   * if that fails too, it marks the session expired and returns the 401 response.
   */
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
  /** Marks the session expired, e.g. after your own API returns 401. */
  markExpired(): void
  /** Resets the idle timer and hides its warning. */
  keepAlive(): void
  can(permission: string): boolean
  hasRole(role: string | readonly string[]): boolean
}

const DEFAULT_REFRESH = 5 * 60_000
const DEFAULT_IDLE_WARNING = 60_000
/** Refresh this long before `expiresAt` (at most half the remaining time), so requests never race the expiry. */
const EXPIRY_MARGIN = 30_000
/**
 * Never refresh for expiry more often than this. Short sessions or a server clock ahead of
 * the browser's would otherwise make every refreshed session look due immediately.
 */
const MIN_EXPIRY_REFRESH_GAP = 10_000

const initialState: AuthState = {
  status: 'loading',
  session: null,
  user: null,
  error: null,
  expired: false,
  idleDeadline: null,
}

function toAuthError(error: unknown): AuthError {
  if (isAuthError(error)) return error
  if (error instanceof TypeError)
    return new AuthError('Can’t reach the server. Check your connection and try again.', {
      code: 'network',
      cause: error,
    })
  const message = error instanceof Error ? error.message : 'Something went wrong. Try again.'
  return new AuthError(message, { cause: error })
}

/**
 * The auth state for one app, independent of React. `AuthProvider` creates one for you;
 * create it yourself when route loaders need it too:
 *
 * ```ts
 * export const auth = createAuthClient(restAdapter({ baseUrl: '/api' }))
 * // <AuthProvider client={auth}> and protectedLoader(auth)
 * ```
 */
export function createAuthClient(
  adapter: AuthAdapter,
  options: AuthClientOptions = {},
): AuthClient {
  const {
    refreshInterval = DEFAULT_REFRESH,
    refreshOnFocus = true,
    syncTabs = true,
    idleTimeout,
    idleWarning = DEFAULT_IDLE_WARNING,
    onSignOut,
  } = options

  let state: AuthState = initialState
  const listeners = new Set<() => void>()
  let loading: Promise<AuthState> | null = null
  let refreshing: Promise<AuthSession | null> | null = null
  let channel: BroadcastChannel | null = null
  const channelName = typeof syncTabs === 'string' ? syncTabs : 'glyph-auth'
  let expiryTimer: ReturnType<typeof setTimeout> | undefined
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let lastActivity = Date.now()
  let lastExpiryRefresh = 0
  let starts = 0
  let stopListeners: (() => void) | null = null
  // Latest-wins for organization switches whose responses can arrive out of order.
  let organizationRequest = 0
  /**
   * The server sign-out failed, so the server may still accept the session (an httpOnly
   * cookie can't be cleared from JavaScript). Until a retry succeeds or the user signs in
   * again, this tab must not restore the session. Kept in sessionStorage to survive reloads.
   */
  const pendingSignOutKey = `${channelName}:sign-out-pending`
  let pendingSignOut = readFlag(pendingSignOutKey)

  function readFlag(key: string): boolean {
    try {
      return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key) === '1'
    } catch {
      return false
    }
  }

  function setPendingSignOut(value: boolean) {
    pendingSignOut = value
    try {
      if (value) sessionStorage.setItem(pendingSignOutKey, '1')
      else sessionStorage.removeItem(pendingSignOutKey)
    } catch {}
  }

  // Idle activity is shared between tabs, so a tab nobody looks at doesn't sign out a user
  // who is busy in another one.
  const activityKey = `${channelName}:activity`
  function shareActivity(at: number) {
    if (!syncTabs) return
    try {
      localStorage.setItem(activityKey, String(at))
    } catch {}
  }
  function latestActivity(): number {
    if (!syncTabs) return lastActivity
    let shared = 0
    try {
      shared = Number(localStorage.getItem(activityKey)) || 0
    } catch {}
    return Math.max(lastActivity, shared)
  }

  function setState(patch: Partial<AuthState>) {
    state = { ...state, ...patch }
    if ('session' in patch) {
      state.user = state.session?.user ?? null
      scheduleExpiry()
      scheduleIdle()
    }
    for (const listener of listeners) listener()
  }

  function setSession(session: AuthSession | null) {
    setState({
      session,
      status: session ? 'authenticated' : 'unauthenticated',
      expired: false,
      error: null,
      idleDeadline: null,
    })
  }

  function broadcast() {
    if (!syncTabs || typeof window === 'undefined') return
    if (channel) channel.postMessage({ type: 'session-changed' })
    else {
      // No BroadcastChannel (old Safari): the storage event reaches the other tabs.
      try {
        localStorage.setItem(`${channelName}:event`, String(Date.now()))
      } catch {}
    }
  }

  function scheduleExpiry() {
    clearTimeout(expiryTimer)
    const expiresAt = state.session?.expiresAt
    if (!expiresAt || starts === 0) return
    const now = Date.now()
    const remaining = expiresAt - now
    // Refreshable sessions renew at half their remaining time at the latest, so short ones
    // don't renew constantly; others are marked expired a full margin early.
    const margin = adapter.refresh ? Math.min(EXPIRY_MARGIN, remaining / 2) : EXPIRY_MARGIN
    let delay = Math.max(0, remaining - margin)
    if (adapter.refresh) delay = Math.max(delay, lastExpiryRefresh + MIN_EXPIRY_REFRESH_GAP - now)
    // setTimeout overflows above ~24.8 days; the interval refresh covers long sessions.
    if (delay > 2 ** 31 - 1) return
    expiryTimer = setTimeout(() => {
      if (adapter.refresh) {
        lastExpiryRefresh = Date.now()
        void client.refresh().catch(() => {})
      } else markExpired()
    }, delay)
  }

  function scheduleIdle() {
    clearTimeout(idleTimer)
    if (!idleTimeout || starts === 0 || state.status !== 'authenticated') return
    const warnAt = latestActivity() + idleTimeout - idleWarning
    idleTimer = setTimeout(
      () => {
        // Activity in another tab moves the whole schedule.
        if (latestActivity() + idleTimeout - idleWarning > Date.now()) return scheduleIdle()
        const deadline = latestActivity() + idleTimeout
        setState({ idleDeadline: deadline })
        idleTimer = setTimeout(
          () => {
            if (latestActivity() + idleTimeout > Date.now()) {
              setState({ idleDeadline: null })
              return scheduleIdle()
            }
            // The local sign-out always happens; a failed server call is reported in state.
            client.signOut({ reason: 'idle' }).catch(() => {})
          },
          Math.max(0, deadline - Date.now()),
        )
      },
      Math.max(0, warnAt - Date.now()),
    )
  }

  function markExpired() {
    if (state.status !== 'authenticated' || state.expired) return
    setState({ expired: true })
  }

  async function run<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action()
    } catch (error) {
      throw toAuthError(error)
    }
  }

  function settle(result: SignInResult): SignInResult {
    if (result.status === 'signed-in') {
      setPendingSignOut(false)
      setSession(result.session)
      broadcast()
    }
    return result
  }

  async function load(): Promise<AuthState> {
    loading ??= (async () => {
      const wasSignedIn = state.status === 'authenticated'
      if (pendingSignOut) {
        // Finish the sign-out the server missed before trusting any session it reports.
        try {
          await adapter.signOut()
          setPendingSignOut(false)
        } catch (error) {
          setState({
            ...(state.status !== 'unauthenticated' && { session: null }),
            status: 'unauthenticated',
            error: toAuthError(error),
          })
          return state
        }
      }
      try {
        const session = await adapter.getSession()
        if (!session && wasSignedIn) {
          // Another tab signed out, or the server dropped the session.
          setSession(null)
          onSignOut?.('remote')
        } else setSession(session)
      } catch (error) {
        // A network blip must not sign anyone out: keep the session, report the error.
        if (state.status === 'loading')
          setState({ status: 'unauthenticated', error: toAuthError(error) })
        else setState({ error: toAuthError(error) })
      }
      return state
    })().finally(() => {
      loading = null
    })
    return loading
  }

  const client: AuthClient = {
    adapter,
    capabilities: adapter.capabilities,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    ready() {
      if (state.status !== 'loading') return Promise.resolve(state)
      return load()
    },
    load,
    start() {
      starts += 1
      if (starts === 1) {
        if (state.status === 'loading') void load()
        stopListeners = attach()
        scheduleExpiry()
        scheduleIdle()
      }
      let stopped = false
      return () => {
        if (stopped) return
        stopped = true
        starts -= 1
        if (starts === 0) {
          stopListeners?.()
          stopListeners = null
          clearTimeout(expiryTimer)
          clearTimeout(idleTimer)
        }
      }
    },
    signIn: (input) => run(async () => settle(await adapter.signIn(input))),
    signUp: (input) =>
      run(async () => {
        if (!adapter.signUp) throw notSupported('sign-up')
        return settle(await adapter.signUp(input))
      }),
    async signOut({ reason = 'user' } = {}) {
      try {
        await adapter.signOut()
        setPendingSignOut(false)
      } catch (error) {
        // The server may still accept the session; don't restore it until a retry succeeds.
        setPendingSignOut(true)
        throw toAuthError(error)
      } finally {
        // Sign out locally even if the server call fails: the user asked to leave.
        setSession(null)
        broadcast()
        onSignOut?.(reason)
      }
    },
    refresh() {
      refreshing ??= (async () => {
        try {
          const session = adapter.refresh ? await adapter.refresh() : await adapter.getSession()
          if (session) setSession(session)
          else markExpired()
          return session
        } catch (error) {
          const authError = toAuthError(error)
          if (authError.status === 401 || authError.code === 'session-expired') markExpired()
          else setState({ error: authError })
          return null
        }
      })().finally(() => {
        refreshing = null
      })
      return refreshing
    },
    requestPasswordReset: (email) =>
      run(async () => {
        if (!adapter.requestPasswordReset) throw notSupported('password reset')
        await adapter.requestPasswordReset(email)
      }),
    resetPassword: (input) =>
      run(async () => {
        if (!adapter.resetPassword) throw notSupported('password reset')
        await adapter.resetPassword(input)
      }),
    verifyEmail: (input) =>
      run(async () => {
        if (!adapter.verifyEmail) throw notSupported('email codes')
        return settle(await adapter.verifyEmail(input))
      }),
    resendVerification: (email) =>
      run(async () => {
        if (!adapter.resendVerification) throw notSupported('email codes')
        await adapter.resendVerification(email)
      }),
    verifySecondFactor: (input) =>
      run(async () => {
        if (!adapter.verifySecondFactor) throw notSupported('two-factor codes')
        return settle(await adapter.verifySecondFactor(input))
      }),
    switchOrganization: (organizationId) =>
      run(async () => {
        if (!adapter.switchOrganization) throw notSupported('organizations')
        const request = ++organizationRequest
        const session = await adapter.switchOrganization(organizationId)
        // A later switch already started: its result wins, whichever response came first.
        if (request !== organizationRequest) return state.session ?? session
        setSession(session)
        broadcast()
        return session
      }),
    updateUser: (patch) =>
      run(async () => {
        if (!adapter.updateUser) throw notSupported('profile updates')
        const session = await adapter.updateUser(patch)
        setSession(session)
        broadcast()
        return session
      }),
    async fetch(input, init) {
      // A Request's body can be read once: keep an untouched copy for the retry.
      const original = input instanceof Request ? input : null
      const spare = original?.clone() ?? null
      const send = async (target: RequestInfo | URL) => {
        // Start from the Request's own headers; `init.headers` would otherwise replace them.
        const headers = new Headers(original?.headers)
        for (const [name, value] of new Headers(init?.headers)) headers.set(name, value)
        const extra = (await adapter.getAuthHeaders?.()) ?? {}
        for (const [name, value] of Object.entries(extra)) headers.set(name, value)
        const credentials = init?.credentials ?? adapter.credentials
        return fetch(target, { ...init, headers, ...(credentials && { credentials }) })
      }
      const response = await send(input)
      if (response.status !== 401 || state.status !== 'authenticated') return response
      const session = await client.refresh()
      if (!session) {
        markExpired()
        return response
      }
      // A streamed body is gone after the first attempt; the caller has to send it again.
      if (typeof ReadableStream !== 'undefined' && init?.body instanceof ReadableStream)
        return response
      const retried = await send(spare ?? input)
      if (retried.status === 401) markExpired()
      return retried
    },
    markExpired,
    keepAlive() {
      lastActivity = Date.now()
      shareActivity(lastActivity)
      if (state.idleDeadline !== null) setState({ idleDeadline: null })
      scheduleIdle()
    },
    can: (permission) => can(state.session, permission),
    hasRole: (role) => hasRole(state.session, role),
  }

  function attach(): () => void {
    if (typeof window === 'undefined') return () => {}
    const cleanups: (() => void)[] = []

    if (refreshOnFocus) {
      const onFocus = () => {
        if (document.visibilityState === 'visible' && state.status !== 'loading') void load()
      }
      window.addEventListener('focus', onFocus)
      document.addEventListener('visibilitychange', onFocus)
      cleanups.push(() => {
        window.removeEventListener('focus', onFocus)
        document.removeEventListener('visibilitychange', onFocus)
      })
    }

    if (refreshInterval) {
      const id = setInterval(() => {
        if (state.status === 'authenticated') void client.refresh().catch(() => {})
      }, refreshInterval)
      cleanups.push(() => clearInterval(id))
    }

    if (syncTabs) {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel(channelName)
        channel.onmessage = () => void load()
        cleanups.push(() => {
          channel?.close()
          channel = null
        })
      } else {
        const onStorage = (event: StorageEvent) => {
          if (event.key === `${channelName}:event`) void load()
        }
        window.addEventListener('storage', onStorage)
        cleanups.push(() => window.removeEventListener('storage', onStorage))
      }
    }

    if (adapter.subscribe) {
      cleanups.push(
        adapter.subscribe((session) => {
          const wasSignedIn = state.status === 'authenticated'
          setSession(session)
          if (!session && wasSignedIn) onSignOut?.('remote')
        }),
      )
    }

    if (idleTimeout) {
      let last = 0
      const onActivity = () => {
        // While the warning shows, only an explicit "Stay signed in" (keepAlive) counts.
        if (state.idleDeadline !== null) return
        const now = Date.now()
        if (now - last < 1000) return
        last = now
        lastActivity = now
        shareActivity(now)
        scheduleIdle()
      }
      const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const
      for (const event of events) window.addEventListener(event, onActivity, { passive: true })
      cleanups.push(() => {
        for (const event of events) window.removeEventListener(event, onActivity)
      })
    }

    return () => {
      for (const cleanup of cleanups) cleanup()
    }
  }

  return client
}
