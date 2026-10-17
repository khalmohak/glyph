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
