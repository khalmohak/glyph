---
"@glyphui/auth": patch
---

Auth fixes, several of them security-related.

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
