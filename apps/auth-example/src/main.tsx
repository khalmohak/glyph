import { AuthProvider } from '@glyphui/auth'
import { guestLoader, protectedLoader } from '@glyphui/auth/react-router'
import { GlyphProvider } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { auth } from './auth'
import { AdminPage, AppLayout, BillingPage, DashboardPage } from './pages/app'
import { ForgotPasswordPage, ResetPasswordPage, SignInPage, SignUpPage } from './pages/auth-pages'
import { HomePage } from './pages/home'
import { Root } from './root'
import { installFakeServer } from './server'
import './index.css'

installFakeServer()

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

const router = createBrowserRouter(
  [
    {
      element: <Root />,
      children: [
        { index: true, element: <HomePage /> },
        // Signed-in visitors skip these and continue to ?next= or the app.
        {
          path: 'sign-in',
          loader: guestLoader(auth, { redirectTo: '/app' }),
          element: <SignInPage />,
        },
        {
          path: 'sign-up',
          loader: guestLoader(auth, { redirectTo: '/app' }),
          element: <SignUpPage />,
        },
        { path: 'forgot-password', element: <ForgotPasswordPage /> },
        { path: 'reset-password', element: <ResetPasswordPage /> },
        {
          path: 'app',
          // Signed-out visitors go to /sign-in?next=… before anything renders.
          loader: protectedLoader(auth, undefined, { basename }),
          element: <AppLayout />,
          children: [
            { index: true, element: <DashboardPage /> },
            { path: 'admin', element: <AdminPage /> },
            { path: 'billing', element: <BillingPage /> },
          ],
        },
      ],
    },
  ],
  { basename },
)

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <GlyphProvider router={reactRouter} toaster>
      <AuthProvider client={auth}>
        <RouterProvider router={router} />
      </AuthProvider>
    </GlyphProvider>
  </StrictMode>,
)
