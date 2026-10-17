import { AuthRevalidator } from '@glyphui/auth/react-router'
import { IdleWarningDialog, SessionExpiredDialog } from '@glyphui/auth/ui'
import { Outlet, useNavigate } from 'react-router'
import { DevInbox } from './dev-inbox'

/** App-wide pieces: the session dialogs and the demo's email inbox. */
export function Root() {
  const navigate = useNavigate()
  return (
    <>
      {/* Sign-outs from the idle timer, another tab or the server re-run the route loaders. */}
      <AuthRevalidator />
      <Outlet />
      <SessionExpiredDialog onSignOut={() => navigate('/sign-in')} />
      <IdleWarningDialog onSignOut={() => navigate('/sign-in')} />
      <DevInbox />
    </>
  )
}
