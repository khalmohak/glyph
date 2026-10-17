# @glyphui/auth

## 0.8.2

### Patch Changes

- [#36](https://github.com/khalmohak/glyph/pull/36) [`c5bbf94`](https://github.com/khalmohak/glyph/commit/c5bbf947a4fa8f5e9bad9fb6d7eebdc36ff798d8) Thanks [@khalmohak](https://github.com/khalmohak)! - The docs moved to [glyphui.xyz](https://glyphui.xyz), with the demo apps at [demo.glyphui.xyz](https://demo.glyphui.xyz) and [auth.glyphui.xyz](https://auth.glyphui.xyz). Package homepages and README links point there; the old GitHub Pages links redirect.

## 0.8.1

## 0.8.0

### Patch Changes

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Auth fixes, several of them security-related.

  **Security**

  - Password reset by code now sends the email with the code, and the memory adapter checks the code against that account only. Before, a 6-digit code was accepted for whichever account it belonged to. Your REST server should do the same: look up the code for `email`, not on its own.
  - Bearer sign-out sends the refresh token so your server can revoke it.
  - When the sign-out request fails (offline, server error), the tab no longer quietly signs back in on the next focus or reload: it retries the server sign-out first.
  - The idle timeout counts activity in every tab, so a background tab no longer signs out someone who is working in another one.
  - `?next=` paths are checked after URL normalization too (`/..//evil.com` is rejected).

  **Reliability**

  - Refresh-token rotation no longer races. A session check and a refresh, or two tabs, used to rotate the same refresh token twice, which servers with reuse detection treat as theft and answer by signing the user out everywhere. Refreshes now take a lock shared across tabs (Web Locks API) and reuse a rotation that already happened.
  - Sessions that last less than a minute, or a server clock ahead of the browser's, no longer cause a refresh loop.
  - `fetch` keeps a `Request`'s own headers and body, and can retry it after a refresh.
  - A `200 { user: null }` session response counts as signed out. Sign-in responses without a user (such as `204` with a cookie) and refresh responses with only tokens load the user from the session endpoint.
  - Servers without a refresh endpoint fall back to checking the session.
  - Rapid organization switches keep the one picked last. `OrganizationSwitcher` takes `onError` and disables its items while switching.
  - `?next=` keeps its own encoding (`/search?q=a%26b` no longer turns into `/search?q=a&b`).

  **Messages**

  - Error responses without a JSON `message` get a readable message instead of the raw body (no more HTML error pages in forms). `429` responses read `Retry-After`, exposed as `AuthError.retryAfter`.
  - A malformed CSRF cookie no longer breaks every request.
  - Sign-out buttons in `UserMenu`, `SessionExpiredDialog` and `IdleWarningDialog` finish signing out even when the server is unreachable.

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - `@glyphui/ui`, `@glyphui/blocks` and `@glyphui/tokens` are now peer dependencies of `@glyphui/auth`, `@glyphui/blocks` and `@glyphui/viewers`, so your app and Glyph share one copy. As regular dependencies, a version mismatch installed a second copy of `@glyphui/ui` with its own React context, and components like `UserMenu` crashed with "must be used inside GlyphProvider". Keep all `@glyphui/*` packages on the same version.

  `ForgotPasswordForm` copy now matches the reset method: with code-based resets it offers to send a code instead of a link.

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Fixes from building a helpdesk app on a real bearer-token API.

  **Auth**

  - **Two-step sign-in works with bearer tokens on multi-user servers.** A server can return a `challenge` with `needs-second-factor` (and `needs-verification`); the client sends it back with the code, so the server knows which sign-in the code completes. The memory adapter and the example app now track each sign-in separately instead of one global "pending" user.
  - **Sign-in links can be completed.** New `completeMagicLink(token)` on the client and adapters (REST: `POST /auth/magic-link/verify`), and a `MagicLinkCallback` screen for the page the link opens.
  - **The session-expired dialog handles two-step accounts:** after the password it asks for the code right there instead of sending people to the sign-in page.
  - **SignUpForm `extraFields`** for invite codes, workspace names and similar. Values are validated with the form and passed to `signUp` as `extra`; the REST adapter sends them with the request.
  - **The code step says how the code arrived** (authenticator app, email or text) from the server's `method`. Override it with `SignInForm twoFactor`.
  - **OrganizationSwitcher `label` and `createLabel`**, so it can say Workspaces or Teams.
  - **`AuthRevalidator` / `useAuthRevalidation()`** for React Router data routers: pages guarded only by `protectedLoader` now redirect after an idle, cross-tab or server sign-out. `IdleWarningDialog onSignOut` also fires for the automatic idle sign-out, and the auth state records `lastSignOut`.
  - Docs cover the bearer-mode server contract (refresh rotation, two-step challenges, magic links, organizations) and the CORS headers a separate API origin needs.

  **UI**

  - Charts that start in a loading or empty state measure their width once data arrives (Funnel, Sankey and Heatmap used to keep a 480px fallback and overflow narrow cards).
  - Gauge inside ChartCard no longer shows its title twice.
  - DataTable phone cards, Alert, form errors, chart tooltips and tables, mega-menu link cards, FileUpload rows and Stepper steps use the container radius, so themes with pill-shaped controls (playful) don't turn them into ovals.
  - The DataTable phone-card list is named after the table.
  - `tableSearch(state)` builds a table URL for deep links; comma-joined values in hand-written links (`f.status=open,pending`) are read as separate filter values. The URL format is documented.
  - `SidebarHeader` grows with its content, so a switcher under the brand isn't clipped.
  - `StaggerItem` no longer needs `index`: it follows document order.

## 0.7.0

### Minor Changes

- [#24](https://github.com/khalmohak/glyph/pull/24) [`b746553`](https://github.com/khalmohak/glyph/commit/b746553b4d380dc7a2a523251b734128a9495b61) Thanks [@khalmohak](https://github.com/khalmohak)! - New package: `@glyphui/auth`. Authentication that runs end to end, from any backend.

  - **Session state.** `AuthProvider` and `useAuth()` give the status, the user and every action: sign in, sign up, sign out, email codes, two-step codes, password reset, organizations. Register your user type once and every API is typed with it. `Can`, `useCan` and `useHasRole` read roles and permissions (`invoices:*` wildcards included).
  - **Sessions that behave.** Re-checked on focus and on an interval, refreshed before they expire, synced across tabs, with an optional idle timeout. `auth.fetch` sends the session to your API, refreshes once on a 401, and opens `SessionExpiredDialog` so users sign back in without losing the page.
  - **Adapters.** `@glyphui/auth/rest` for your own API (httpOnly cookies or bearer tokens with refresh rotation, CSRF, field errors), `@glyphui/auth/firebase`, `@glyphui/auth/clerk` (a bridge inside `ClerkProvider`), and `@glyphui/auth/memory` for prototypes and tests.
  - **Protected routes for React Router.** `RequireAuth`, `GuestOnly`, `RequireRole`, and `protectedLoader` / `guestLoader` for data routers. The path the user wanted goes into `?next=` and they return there after signing in; only same-origin paths are followed.
  - **Screens.** `SignInForm`, `SignUpForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `VerifyEmailForm`, `TwoFactorForm`, `MagicLinkSent`, `SocialButtons`, `AuthLayout`, `UserMenu`, `OrganizationSwitcher`, `SessionExpiredDialog` and `IdleWarningDialog`, built from Glyph components and themed by your theme file. Import `@glyphui/auth/styles.css` after the Glyph stylesheets.

### Patch Changes

- Updated dependencies [[`b746553`](https://github.com/khalmohak/glyph/commit/b746553b4d380dc7a2a523251b734128a9495b61)]:
  - @glyphui/ui@0.7.0
  - @glyphui/tokens@0.7.0
  - @glyphui/blocks@0.7.0
