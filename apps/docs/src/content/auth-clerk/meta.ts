import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Clerk bridge',
  slug: 'auth-clerk',
  category: 'Auth',
  status: 'beta',
  description:
    'Use Glyph’s guards, useAuth() and screens with Clerk: the bridge mirrors Clerk’s session into Glyph.',
  entry: '@glyphui/auth/clerk',
  exports: ['ClerkAuthBridge', 'createClerkBridge'],
  source: 'adapters/clerk.tsx',
  propsOf: 'ClerkAuthBridge',
  snippets: [
    {
      file: 'setup',
      title: 'Set up',
      description: 'Render the bridge inside ClerkProvider. Install @clerk/react 6 or later.',
    },
  ],
  notes: [
    'Glyph’s forms handle email and password, sign-up email codes, authenticator codes and reset codes through Clerk.',
    'OAuth redirects through Clerk: render Clerk’s <AuthenticateWithRedirectCallback /> at oauthCallbackUrl (default /sso-callback).',
    'Passkeys, enterprise SSO and bot protection need Clerk’s own components; use them alongside Glyph’s guards.',
    'Roles come from publicMetadata.roles plus the active organization role; permissions from publicMetadata.permissions.',
    'Clerk refreshes tokens and syncs tabs itself, so the bridge turns those Glyph timers off.',
    'auth.fetch sends Clerk’s session token as a bearer token.',
  ],
})
