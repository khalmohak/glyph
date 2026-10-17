import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Auth provider',
  slug: 'auth',
  category: 'Auth',
  status: 'beta',
  description:
    'Session state for the whole app: who is signed in, their roles and permissions, and every sign-in action, from any backend.',
  entry: '@glyphui/auth',
  exports: [
    'AuthProvider',
    'useAuth',
    'useUser',
    'useSession',
    'useCan',
    'useHasRole',
    'Can',
    'useAuthClient',
    'createAuthClient',
    'AuthError',
    'isAuthError',
    'can',
    'hasRole',
    'NEXT_PARAM',
    'safeRedirectPath',
    'signInPathFor',
  ],
  source: 'react/provider.tsx',
  propsOf: 'AuthProvider',
  examples: [
    {
      file: 'session',
      title: 'Session state',
      description:
        'useAuth() gives the status, the user and every action. This demo uses the in-memory adapter.',
    },
    {
      file: 'permissions',
      title: 'Roles and permissions',
      description:
        'Can and useCan read permissions such as invoices:write; invoices:* is a wildcard.',
    },
  ],
  snippets: [
    {
      file: 'setup',
      title: 'Set up',
      description:
        'Create the client once and pass it to AuthProvider. Route loaders use the same client.',
    },
    {
      file: 'register',
      title: 'Type your user',
      description: 'Register your user shape once; useAuth, guards and screens are typed with it.',
    },
    {
      file: 'auth-fetch',
      title: 'Call your API',
      description:
        'auth.fetch adds the session, refreshes once on a 401, and opens SessionExpiredDialog if that fails.',
    },
  ],
  notes: [
    'Status is loading until the adapter answers, then authenticated or unauthenticated. Guards show a spinner while loading.',
    'The session is re-checked when the tab regains focus and every 5 minutes (refreshInterval), and refreshed just before expiresAt.',
    'Signing in or out in one tab updates every other tab (syncTabs). Pass a name when two apps share an origin.',
    'idleTimeout signs users out after inactivity; IdleWarningDialog warns them first.',
    'Can and RequireRole only shape the UI. Your API must check the same permissions.',
    'Adapter errors are AuthError instances; fieldErrors holds messages for individual form fields.',
  ],
})
