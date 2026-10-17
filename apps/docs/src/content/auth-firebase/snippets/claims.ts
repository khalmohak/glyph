// On your server (firebase-admin), once per role change:
//   await getAuth().setCustomUserClaims(uid, { roles: ['admin'], permissions: ['billing:*'] })
//
// In the app, the adapter reads them; the user picks them up on the next token refresh
// (auth.refresh() forces one).
import { useCan } from '@glyphui/auth'

export function useCanManageBilling() {
  return useCan('billing:manage')
}
