import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'MagicLinkCallback',
  slug: 'magic-link-callback',
  category: 'Auth',
  status: 'beta',
  description:
    'The page a sign-in link opens: trades the link’s token for a session, then continues where the user was going.',
  entry: '@glyphui/auth/ui',
  exports: ['MagicLinkCallback'],
  source: 'ui/magic-link-callback.tsx',
  propsOf: 'MagicLinkCallback',
  examples: [
    {
      file: 'callback',
      title: 'Open a sign-in link',
      description:
        'Send a link to ada@example.com, then open it: the callback signs in and reports success. Opening it twice shows the expired state.',
    },
  ],
  notes: [
    'By default it reads ?token= from the URL; pass token (or param) when your link differs.',
    'With React Router: onSuccess={useRedirectAfterSignIn("/app")} continues to ?next= or your default.',
    'Accounts with two-step sign-in continue to the code step on the same page.',
    'Needs an adapter with capabilities.magicLink. The REST adapter posts the token to /auth/magic-link/verify.',
    'A link works once: React’s development double effects don’t spend it twice.',
  ],
})
