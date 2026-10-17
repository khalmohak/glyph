import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Firebase adapter',
  slug: 'auth-firebase',
  category: 'Auth',
  status: 'beta',
  description:
    'Glyph auth on Firebase Authentication: email and password, Google, GitHub, Apple and Microsoft, reset and verification emails.',
  entry: '@glyphui/auth/firebase',
  exports: ['firebaseAdapter', 'firebaseError'],
  source: 'adapters/firebase.ts',
  snippets: [
    {
      file: 'setup',
      title: 'Set up',
      description: 'Pass your initialized Auth instance. Install firebase 11 or later.',
    },
    {
      file: 'claims',
      title: 'Roles from custom claims',
      description:
        'Set roles and permissions with the Admin SDK; the adapter reads them from the ID token.',
    },
  ],
  notes: [
    'Firebase verifies emails and resets passwords with emailed links, so the screens show "check your inbox" steps instead of code inputs.',
    'Unverified email/password accounts count as signed out until they open the link (requireEmailVerification: false to allow them).',
    'auth.fetch sends the Firebase ID token as a bearer token; verify it on your server with the Admin SDK.',
    'oauthFlow: "redirect" works better than popups on mobile Safari.',
    'Firebase multi-factor and email-link sign-in are not wired yet.',
  ],
})
