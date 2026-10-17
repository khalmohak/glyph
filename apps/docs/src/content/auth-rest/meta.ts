import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'REST adapter',
  slug: 'auth-rest',
  category: 'Auth',
  status: 'beta',
  description:
    'Connect Glyph auth to your own API: httpOnly cookie sessions or bearer tokens with refresh rotation.',
  entry: '@glyphui/auth/rest',
  exports: ['restAdapter', 'defaultEndpoints'],
  source: 'adapters/rest.ts',
  snippets: [
    {
      file: 'cookie',
      title: 'Cookie sessions (recommended)',
      description:
        'Your server sets an httpOnly cookie, so no token is readable by JavaScript. Add a CSRF header for writes.',
    },
    {
      file: 'bearer',
      title: 'Bearer tokens',
      description:
        'For APIs on another domain. Tokens rotate on refresh; pick where they are stored.',
    },
    {
      file: 'contract',
      title: 'What your server returns',
      description:
        'The adapter expects these shapes. Rename endpoints or map other shapes with options.',
    },
  ],
  notes: [
    'Endpoints default to /auth/session, /auth/sign-in, /auth/sign-up, /auth/sign-out, /auth/refresh, /auth/password/forgot, /auth/password/reset and /auth/verify; override any with endpoints.',
    'GET session must return 401 when signed out. A 401 with a refresh token tries one refresh first.',
    'Return 202 with { status: "needs-verification" } or "needs-second-factor" and the screens show the next step.',
    'Error bodies with { errors: { email: "…" } } show next to the matching form fields.',
    'storage: "memory" keeps bearer tokens out of web storage, at the cost of signing in again after a reload.',
    'Set capabilities to match what your server implements, e.g. { oauthProviders: ["google"], organizations: true }.',
  ],
})
