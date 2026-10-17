# @glyphui/auth

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
