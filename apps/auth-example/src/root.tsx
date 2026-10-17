import { IdleWarningDialog, SessionExpiredDialog } from '@glyphui/auth/ui'
import { Outlet, useNavigate } from 'react-router'
import { DevInbox } from './dev-inbox'

/** App-wide pieces: the session dialogs and the demo's email inbox. */
export function Root() {
  const navigate = useNavigate()
  return (
    <>
      <Outlet />
      <SessionExpiredDialog onSignOut={() => navigate('/sign-in')} />
      <IdleWarningDialog onSignOut={() => navigate('/sign-in')} />
      <DevInbox />
    </>
  )
}
