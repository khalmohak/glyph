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
// or { status: 'needs-second-factor' }

// 4xx — shown above the form, or next to fields listed in `errors`
export const failed = {
  message: 'An account with this email already exists.',
  code: 'email-taken',
  errors: { email: 'An account with this email already exists. Sign in instead.' },
}
