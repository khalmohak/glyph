import { GlyphProvider, presets } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './fonts'
import './index.css'
import { Layout } from './layout'
import { CatalogPage } from './pages/catalog'
import { DocPage } from './pages/doc-page'
import { GettingStartedPage } from './pages/getting-started'
import { HomePage } from './pages/home'
import { NotFoundPage } from './pages/not-found'
import { ThemeChoiceProvider } from './theme-choice'

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'getting-started', element: <GettingStartedPage /> },
        { path: 'components', element: <CatalogPage /> },
        { path: 'components/:slug', element: <DocPage /> },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeChoiceProvider>
      {(theme) => (
        <GlyphProvider theme={presets[theme]} defaultMode="dark" router={reactRouter} toaster>
          <RouterProvider router={router} />
        </GlyphProvider>
      )}
    </ThemeChoiceProvider>
  </StrictMode>,
)
