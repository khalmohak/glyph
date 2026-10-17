import type { AuthSession } from './types'

function rolesOf(session: AuthSession | null): readonly string[] {
  if (!session) return []
  const userRoles = (session.user as { roles?: unknown }).roles
  return session.roles ?? (Array.isArray(userRoles) ? (userRoles as string[]) : [])
}

function permissionsOf(session: AuthSession | null): readonly string[] {
  if (!session) return []
  const userPermissions = (session.user as { permissions?: unknown }).permissions
  return (
    session.permissions ?? (Array.isArray(userPermissions) ? (userPermissions as string[]) : [])
  )
}

/** True when the session has any of the given roles. */
export function hasRole(session: AuthSession | null, role: string | readonly string[]): boolean {
  const wanted = typeof role === 'string' ? [role] : role
  const roles = rolesOf(session)
  return wanted.some((r) => roles.includes(r))
}

/**
 * True when the session grants `permission`. A granted `invoices:*` covers every
 * `invoices:...` permission, and `*` covers everything.
 */
export function can(session: AuthSession | null, permission: string): boolean {
  for (const granted of permissionsOf(session)) {
    if (granted === '*' || granted === permission) return true
    if (granted.endsWith(':*') && permission.startsWith(granted.slice(0, -1))) return true
  }
  return false
}
