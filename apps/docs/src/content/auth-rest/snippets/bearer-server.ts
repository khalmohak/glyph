// Bearer mode: what your API needs beyond the shared contract.

// POST /auth/refresh  { refreshToken }
// 200 → new tokens (and optionally the session). Rotate: the old refresh token stops
// working. If an old token is reused, revoke the whole family and answer 401; the client
// then shows SessionExpiredDialog. Glyph never sends two refreshes at once, even across tabs.
export const refreshed = {
  accessToken: 'eyJ…',
  refreshToken: 'r_2…',
  expiresAt: 1767225660000, // optional; the client refreshes shortly before it
}

// POST /auth/organization  { organizationId }  →  200 with the session for that organization
// GET  /auth/session       →  200 with the session; tokens are optional here

// CORS, when the API is on another origin (e.g. api.acme.com for app.acme.com):
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.acme.com', // the app's origin, not *
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}
// Answer OPTIONS preflights with these headers and 204. Bearer mode sends no cookies, so
// Access-Control-Allow-Credentials isn't needed; cookie mode across origins needs it, plus
// SameSite=None; Secure cookies.
