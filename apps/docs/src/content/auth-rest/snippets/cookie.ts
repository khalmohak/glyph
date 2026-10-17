import { createAuthClient } from '@glyphui/auth'
import { restAdapter } from '@glyphui/auth/rest'

export const auth = createAuthClient(
  restAdapter({
    baseUrl: 'https://api.acme.com',
    // The server sets an httpOnly, Secure, SameSite cookie on sign-in.
    mode: 'cookie',
    // Read the CSRF token your server put in a readable cookie and echo it on writes.
    csrf: { header: 'X-CSRF-Token', cookie: 'csrf_token' },
    capabilities: { oauthProviders: ['google', 'github'] },
  }),
)
