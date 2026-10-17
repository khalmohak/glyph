import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Protected routes',
  slug: 'protected-routes',
  category: 'Auth',
  status: 'beta',
  description:
    'Guards and loaders for React Router: signed-out users go to sign-in and come back to where they were going.',
  entry: '@glyphui/auth/react-router',
  exports: [
    'RequireAuth',
    'GuestOnly',
    'RequireRole',
    'protectedLoader',
    'guestLoader',
    'useRedirectAfterSignIn',
    'AuthRevalidator',
    'useAuthRevalidation',
    'NEXT_PARAM',
    'safeRedirectPath',
    'signInPathFor',
  ],
  source: 'react-router/index.tsx',
  propsOf: 'RequireAuth',
  examples: [
    {
      file: 'role-gate',
      title: 'Role-gated content',
      description:
        'RequireRole shows its fallback to users without the role. Switch users to see both.',
    },
  ],
  snippets: [
    {
      file: 'components',
      title: 'With route elements',
      description:
        'RequireAuth as a layout route protects everything under it; GuestOnly keeps signed-in users off the sign-in page.',
    },
    {
      file: 'loaders',
      title: 'With data routers',
      description:
        'Loaders redirect before anything renders or fetches. AuthRevalidator re-runs them when the session ends on an open page (idle timeout, another tab, the server).',
    },
  ],
  notes: [
    'The current path and query go into ?next=, and after sign-in useRedirectAfterSignIn (or GuestOnly) returns there.',
    'Only same-origin paths are followed: https://evil.com, //evil.com and javascript: in ?next= fall back to your default.',
    'RequireRole takes roles (any of several) and/or permission; give it a fallback or get a "no access" message.',
    'Guards render a spinner while the session loads; pass loading to change it.',
    'With loaders, render <AuthRevalidator /> once in your root route (or call useAuthRevalidation()): it re-runs loaders on sign-in and sign-out, so protectedLoader pages redirect after an idle or cross-tab sign-out.',
    'Requires react-router 7 or later.',
  ],
})
