# @glyphui/auth

Authentication for [Glyph](https://github.com/khalmohak/glyph) apps: session state, protected routes and ready sign-in screens, on your own REST API, Firebase or Clerk.

[Docs](https://glyphui.xyz/components/auth) · [Live example](https://auth.glyphui.xyz/) · [Changelog](https://github.com/khalmohak/glyph/blob/main/packages/auth/CHANGELOG.md)

## Install

```sh
npm install @glyphui/auth @glyphui/ui @glyphui/blocks
# the screens use Glyph's forms:
npm install react-hook-form @hookform/resolvers
# protected routes:
npm install react-router
```

```css
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/blocks/styles.css";
@import "@glyphui/auth/styles.css";
```

## Set up

```tsx
// auth.ts
import { createAuthClient } from '@glyphui/auth'
import { restAdapter } from '@glyphui/auth/rest'

export const auth = createAuthClient(restAdapter({ baseUrl: '/api' }))

// main.tsx
<GlyphProvider router={reactRouter}>
  <AuthProvider client={auth}>
    <App />
    <SessionExpiredDialog />
  </AuthProvider>
</GlyphProvider>
```

```tsx
// Anywhere
const { status, user, signOut, can } = useAuth()
```

Type your user once and every API follows:

```ts
declare module '@glyphui/auth' {
  interface Register {
    user: { id: string; email: string; name: string; plan: 'free' | 'pro' }
  }
}
```

## Adapters

| Import | For |
|---|---|
| `@glyphui/auth/rest` | Your own API. httpOnly cookie sessions (default) or bearer tokens with refresh rotation; CSRF header; `{ errors: { email } }` bodies become field errors. |
| `@glyphui/auth/firebase` | Firebase Authentication: email and password, Google, GitHub, Apple, Microsoft, reset and verification emails, roles from custom claims. Needs `firebase` 11+. |
| `@glyphui/auth/clerk` | `<ClerkAuthBridge>` inside `<ClerkProvider>`: Glyph's guards and screens on Clerk. Needs `@clerk/react` 6+. |
| `@glyphui/auth/memory` | A complete backend in the browser for prototypes, demos and tests. Never for production. |

Write your own by implementing `AuthAdapter`: only `capabilities`, `getSession`, `signIn` and `signOut` are required.

## Protected routes (React Router 7+)

```tsx
import { GuestOnly, RequireAuth, RequireRole, protectedLoader } from '@glyphui/auth/react-router'

<Route element={<GuestOnly redirectTo="/app" />}>
  <Route path="/sign-in" element={<SignInPage />} />
</Route>
<Route path="/app" element={<RequireAuth />}>
  <Route path="billing" element={<RequireRole permission="billing:manage" />}>…</Route>
</Route>

// Data routers: redirect before rendering
{ path: '/app', loader: protectedLoader(auth), element: <RequireAuth /> }
```

Signed-out users go to `/sign-in?next=/where/they/were`; `useRedirectAfterSignIn()` and `GuestOnly` send them back. Only same-origin paths are followed.

## Screens (`@glyphui/auth/ui`)

`SignInForm` (password, OAuth, email link, then any code step) · `SignUpForm` (with email code) · `ForgotPasswordForm` · `ResetPasswordForm` · `VerifyEmailForm` · `TwoFactorForm` · `MagicLinkSent` · `SocialButtons` · `AuthLayout` · `AuthNotice` · `UserMenu` · `OrganizationSwitcher` · `SessionExpiredDialog` · `IdleWarningDialog`

They're built from Glyph components, so your theme file styles them, and each one hides flows the adapter doesn't support.

## Sessions

- The session is re-checked on window focus and every 5 minutes, and refreshed just before `expiresAt`.
- Tabs stay in sync: sign out in one, and every tab follows.
- `auth.fetch(url)` sends the session to your API. On a 401 it refreshes once and retries; if that fails, `SessionExpiredDialog` asks the user to sign back in without leaving the page.
- `idleTimeout` signs users out after inactivity, and `IdleWarningDialog` warns them first.

Hiding UI with `Can` or `RequireRole` is a convenience: your API must check permissions too.

## License

MIT
