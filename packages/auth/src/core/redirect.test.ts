import { describe, expect, it } from 'vitest'
import { can, hasRole } from './permissions'
import { safeRedirectPath, signInPathFor } from './redirect'
import type { AuthSession } from './types'

describe('safeRedirectPath', () => {
  it.each([
    ['/invoices', '/invoices'],
    ['/invoices?page=2#top', '/invoices?page=2#top'],
    [encodeURIComponent('/invoices?page=2'), '/invoices?page=2'],
  ])('allows the same-origin path %s', (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected)
  })

  it.each([
    null,
    undefined,
    '',
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    '%2F%2Fevil.com',
    'javascript:alert(1)',
    '/\u0000evil',
    '%E0%A4%A',
    'invoices',
  ])('rejects %s', (input) => {
    expect(safeRedirectPath(input, '/home')).toBe('/home')
  })
})

describe('safeRedirectPath: real-world inputs', () => {
  it('keeps encoded characters in a next param that URLSearchParams already decoded', () => {
    // RequireAuth encodes /invoices?q=a%26b; URLSearchParams.get() decodes it once.
    const next = new URLSearchParams(signInPathFor('/sign-in', '/invoices?q=a%26b').split('?')[1])
    expect(safeRedirectPath(next.get('next'))).toBe('/invoices?q=a%26b')
    expect(safeRedirectPath('/files/report%2F2026.pdf')).toBe('/files/report%2F2026.pdf')
    expect(safeRedirectPath('/deals?discount=50%')).toBe('/deals?discount=50%')
  })

  it.each([
    '/..//evil.com',
    '/a/../..//evil.com',
    '/%2e%2e//evil.com',
    '/%5Cevil.com',
    '/\\evil.com',
    '\\\\evil.com',
    '/\t/evil.com',
    '/%09/evil.com',
    '%252F%252Fevil.com',
  ])('rejects %s', (input) => {
    expect(safeRedirectPath(input, '/home')).toBe('/home')
  })

  it('never returns a path that leaves the origin (fuzzed)', () => {
    const parts = [
      '/',
      '//',
      '\\',
      '..',
      '.',
      '%2F',
      '%5C',
      '%2e',
      '%09',
      '\t',
      'evil.com',
      '@',
      ':',
      '?',
      '#',
      'a',
      '%25',
      'javascript:',
      '\u3000',
      '／',
    ]
    let seed = 7
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 5000; i++) {
      let input = random() < 0.8 ? '/' : ''
      const length = 1 + Math.floor(random() * 6)
      for (let j = 0; j < length; j++) input += parts[Math.floor(random() * parts.length)]
      const result = safeRedirectPath(input, '/home')
      if (result === '/home') continue
      const base = 'https://app.example'
      expect(result.startsWith('/'), input).toBe(true)
      expect(result.startsWith('//'), input).toBe(false)
      expect(new URL(result, base).origin, input).toBe(base)
      // Browsers and routers normalize dot segments; the result must not become protocol-relative.
      expect(new URL(result, base).pathname.startsWith('//'), input).toBe(false)
    }
  })
})

describe('signInPathFor', () => {
  it('adds the current path as next', () => {
    expect(signInPathFor('/sign-in', '/a?b=1')).toBe('/sign-in?next=%2Fa%3Fb%3D1')
    expect(signInPathFor('/sign-in?x=1', '/a')).toBe('/sign-in?x=1&next=%2Fa')
    expect(signInPathFor('/sign-in', '/')).toBe('/sign-in')
  })
})

describe('permissions', () => {
  const session: AuthSession = {
    user: { id: '1', email: 'a@b.co' },
    roles: ['editor'],
    permissions: ['posts:*', 'comments:read'],
  }
  it('matches exact permissions and wildcards', () => {
    expect(can(session, 'posts:delete')).toBe(true)
    expect(can(session, 'comments:read')).toBe(true)
    expect(can(session, 'comments:write')).toBe(false)
    expect(can({ ...session, permissions: ['*'] }, 'anything')).toBe(true)
    expect(can(null, 'posts:read')).toBe(false)
  })
  it('reads roles from the session or the user', () => {
    expect(hasRole(session, 'editor')).toBe(true)
    const fromUser = { user: { id: '1', email: 'x', roles: ['admin'], permissions: ['x:y'] } }
    expect(hasRole(fromUser as unknown as AuthSession, ['admin'])).toBe(true)
    expect(can(fromUser as unknown as AuthSession, 'x:y')).toBe(true)
    expect(hasRole(null, 'admin')).toBe(false)
  })
})
