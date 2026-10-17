import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Memory adapter',
  slug: 'auth-memory',
  category: 'Auth',
  status: 'beta',
  description:
    'A complete auth backend in the browser for prototypes, demos and tests: sign-up, email codes, two-step, magic links, organizations.',
  entry: '@glyphui/auth/memory',
  exports: ['memoryAdapter'],
  source: 'adapters/memory.ts',
  examples: [
    {
      file: 'prototype',
      title: 'Prototype a full flow',
      description:
        'Every screen works against it. "Emailed" codes appear as toasts here; by default they are logged to the console.',
    },
  ],
  snippets: [
    {
      file: 'tests',
      title: 'In tests',
      description: 'No latency, seeded users, and the last code or token at hand.',
    },
  ],
  notes: [
    'Passwords are stored in plain text. Never use it in production.',
    'persist: "local" keeps users and the session in localStorage, shared between tabs.',
    'fail lets an operation throw, to see error states: fail: (op) => op === "signIn" ? new AuthError("Down") : undefined.',
    'expireSession() revokes the session server-side, to try SessionExpiredDialog.',
  ],
})
