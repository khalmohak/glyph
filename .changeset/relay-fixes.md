---
"@glyphui/auth": patch
"@glyphui/ui": patch
"@glyphui/viewers": patch
---

Fixes from building a helpdesk app on a real bearer-token API.

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
