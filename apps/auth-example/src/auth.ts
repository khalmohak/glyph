import { createAuthClient } from '@glyphui/auth'
import { restAdapter } from '@glyphui/auth/rest'

/**
 * One client for the provider and the route loaders. The REST adapter talks to the fake
 * server in `server.ts`; point `baseUrl` at your real API and nothing else changes.
 */
export const auth = createAuthClient(
  restAdapter({
    baseUrl: `${import.meta.env.BASE_URL}api`,
    mode: 'bearer',
    capabilities: { twoFactor: true, organizations: true, magicLink: true },
  }),
  { idleTimeout: 30 * 60_000 },
)
