import { createAuthClient } from '@glyphui/auth'
import { guestLoader, protectedLoader, RequireAuth } from '@glyphui/auth/react-router'
import { restAdapter } from '@glyphui/auth/rest'
import { createBrowserRouter, Outlet } from 'react-router'

export const auth = createAuthClient(restAdapter({ baseUrl: '/api' }))

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    // Rendered while the first loaders run (the session check), so there's no blank page.
    hydrateFallbackElement: <p>Loading…</p>,
    children: [
      {
        path: '/sign-in',
        loader: guestLoader(auth, { redirectTo: '/app' }),
        element: <p>Sign in</p>,
      },
      {
        path: '/app',
        loader: protectedLoader(auth),
        element: (
          <RequireAuth>
            <Outlet />
          </RequireAuth>
        ),
        children: [
          {
            path: 'invoices',
            // Runs only for signed-in users; auth.fetch sends the session.
            loader: protectedLoader(auth, () => auth.fetch('/api/invoices').then((r) => r.json())),
            element: <p>Invoices</p>,
          },
        ],
      },
    ],
  },
])
