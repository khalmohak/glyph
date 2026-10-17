// POST /auth/sign-in  { email, password }
// 200 — signed in (bearer mode also returns tokens)
export const signedIn = {
  user: { id: 'u_1', email: 'ada@example.com', name: 'Ada Lovelace' },
  expiresAt: 1767225600000, // ms; the client refreshes just before
  roles: ['admin'],
  permissions: ['invoices:*'],
  organizations: [{ id: 'org_1', name: 'Acme', role: 'owner' }],
  activeOrganizationId: 'org_1',
  accessToken: 'eyJ…', // bearer mode only
  refreshToken: 'r_…', // bearer mode only, rotated on every refresh
}

// 202 — another step first; the screens show the right form
export const nextStep = { status: 'needs-verification', email: 'ada@example.com' }

// 202 — the password was right; ask for a second factor. `challenge` (any JSON) comes back
// with the code, so the server knows which sign-in it completes even without a cookie.
// `method` ('totp' | 'email' | 'sms') sets the wording; `email` is shown for emailed codes.
export const secondFactor = {
  status: 'needs-second-factor',
  challenge: 'ch_9f2c…',
  method: 'email',
  email: 'ada@example.com',
}
// POST /auth/two-factor  { code, challenge }  →  200 like sign-in
// POST /auth/verify      { email, code, challenge? }  →  200 like sign-in

// 204 (or 200 without `user`) also works: the user is then read from GET /auth/session.
// GET /auth/session — 200 `{ user: null }` when signed out (recommended). A 401 works too,
// but browsers log every 401 as a console error, on each signed-out page view.

// 4xx — shown above the form, or next to fields listed in `errors`
export const failed = {
  message: 'An account with this email already exists.',
  code: 'email-taken',
  errors: { email: 'An account with this email already exists. Sign in instead.' },
}
// Without a JSON `message`, a friendly text is used per status; 429 honors Retry-After.

// POST /auth/sign-up — { email, password, name?, ...extra } (SignUpForm extraFields, e.g. inviteCode)
// POST /auth/magic-link         { email }  →  202 { status: 'magic-link-sent' }
// POST /auth/magic-link/verify  { token }  →  200 like sign-in (MagicLinkCallback calls it)
// POST /auth/sign-out — bearer mode sends { refreshToken } so the server can revoke it.
// POST /auth/password/reset — { token, password }, plus { email } for code-based resets:
// check the code against that account only.
