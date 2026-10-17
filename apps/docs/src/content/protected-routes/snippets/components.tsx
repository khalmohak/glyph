import {
  GuestOnly,
  RequireAuth,
  RequireRole,
  useRedirectAfterSignIn,
} from '@glyphui/auth/react-router'
import { SignInForm } from '@glyphui/auth/ui'
import { Route, Routes } from 'react-router'

function SignInPage() {
  const continueToApp = useRedirectAfterSignIn('/app')
  return (
    <SignInForm
      signUpHref="/sign-up"
      forgotPasswordHref="/forgot-password"
      onSuccess={continueToApp}
    />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly redirectTo="/app" />}>
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>
      <Route path="/app" element={<RequireAuth redirectTo="/sign-in" />}>
        <Route index element={<p>Dashboard</p>} />
        <Route path="billing" element={<RequireRole permission="billing:manage" />}>
          <Route index element={<p>Billing</p>} />
        </Route>
      </Route>
    </Routes>
  )
}
