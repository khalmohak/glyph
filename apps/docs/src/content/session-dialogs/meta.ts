import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Session dialogs',
  slug: 'session-dialogs',
  category: 'Auth',
  status: 'beta',
  description:
    'Sign back in when a session expires mid-task without losing the page, and warn before an idle sign-out.',
  entry: '@glyphui/auth/ui',
  exports: ['SessionExpiredDialog', 'IdleWarningDialog'],
  source: 'ui/session-dialogs.tsx',
  propsOf: 'SessionExpiredDialog',
  examples: [
    {
      file: 'expired',
      title: 'Expired session',
      description:
        'Revoke the session “on the server”, then call the API: the dialog asks for the password (pw).',
    },
  ],
  notes: [
    'Render both once near the root, inside AuthProvider.',
    'SessionExpiredDialog opens when auth.fetch gets a 401 that a refresh can’t fix, or when you call auth.markExpired().',
    'It can’t be dismissed by Escape or clicking outside: the user signs in again or signs out.',
    'IdleWarningDialog needs idleTimeout on the client; activity before the warning resets the timer.',
  ],
})
