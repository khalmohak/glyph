// auth.ts: create the client once. AuthProvider and route loaders share it.
import { AuthProvider, createAuthClient } from '@glyphui/auth'
import { guestLoader, protectedLoader, RequireAuth } from '@glyphui/auth/react-router'
import { restAdapter } from '@glyphui/auth/rest'
import { SessionExpiredDialog } from '@glyphui/auth/ui'
import { GlyphProvider } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router'

export const auth = createAuthClient(restAdapter({ baseUrl: '/api' }), {
  idleTimeout: 30 * 60_000, // optional: sign out after 30 idle minutes
})

// router.tsx
const router = createBrowserRouter([
  {
    element: <Outlet />,
    // Shown while the first loaders run, instead of a blank page (and React Router's warning).
    hydrateFallbackElement: <p>Loading…</p>,
    children: [
      { path: 'sign-in', loader: guestLoader(auth), element: <p>Sign in</p> },
      {
        path: 'app',
        loader: protectedLoader(auth),
        element: (
          <RequireAuth>
            <Outlet />
          </RequireAuth>
        ),
      },
    ],
  },
])

// main.tsx: Glyph outermost, then auth, then the router, so every route and loader-rendered
// page can use both. The router's links reach Glyph through `router={reactRouter}`.
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <GlyphProvider router={reactRouter} toaster>
      <AuthProvider client={auth}>
        <RouterProvider router={router} />
        <SessionExpiredDialog />
      </AuthProvider>
    </GlyphProvider>
  </StrictMode>,
)
