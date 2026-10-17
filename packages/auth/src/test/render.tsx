import { GlyphProvider } from '@glyphui/ui'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { type MemoryAdapterOptions, memoryAdapter } from '../adapters/memory'
import { type AuthClient, type AuthClientOptions, createAuthClient } from '../core/client'
import { AuthProvider } from '../react/provider'

export const ada = {
  email: 'ada@example.com',
  password: 'correct horse',
  name: 'Ada Lovelace',
  roles: ['admin'],
  permissions: ['invoices:*'],
  organizations: [
    { id: 'org_1', name: 'Analytical Engines', role: 'owner' },
    { id: 'org_2', name: 'Difference Ltd', role: 'member' },
  ],
}

export const grace = {
  email: 'grace@example.com',
  password: 'cobol rules',
  name: 'Grace Hopper',
  roles: ['member'],
  twoFactor: true,
}

export function setup(options: MemoryAdapterOptions = {}, clientOptions: AuthClientOptions = {}) {
  const adapter = memoryAdapter({
    latency: 0,
    users: [ada, grace],
    onCode: () => {},
    ...options,
  })
  const client = createAuthClient(adapter, {
    syncTabs: false,
    refreshOnFocus: false,
    ...clientOptions,
  })
  return { adapter, client }
}

export function Providers({ client, children }: { client: AuthClient; children: ReactNode }) {
  return (
    <GlyphProvider storageKey={null} motion="none">
      <AuthProvider client={client}>{children}</AuthProvider>
    </GlyphProvider>
  )
}

export function renderWithAuth(ui: ReactNode, client: AuthClient) {
  return render(<Providers client={client}>{ui}</Providers>)
}
