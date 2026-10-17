import { GlyphProvider, LoadingState, presets } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'
import { setPdfWorker } from '@glyphui/viewers/pdf'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { type ComponentType, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './fonts'
import './index.css'
import type { DocsRouteHandle } from './shell/docs-layout'
import { DocsLayout } from './shell/docs-layout'
import { PageLayout } from './shell/page-layout'
import { SiteLayout } from './shell/site-layout'
import { ThemeChoiceProvider } from './theme-choice'

// Serve pdf.js's worker from this site instead of the default CDN.
setPdfWorker(pdfWorker)

// Each page is its own chunk. React Router loads it before rendering the route, so pages
// never suspend mid-navigation.
const page =
  <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  async () => ({ Component: (await load())[name] })

const comingSoon = () => import('./pages/coming-soon')

const router = createBrowserRouter(
  [
    {
      element: <SiteLayout />,
      hydrateFallbackElement: <LoadingState label="Loading" className="min-h-dvh" />,
      children: [
        {
          element: <PageLayout />,
          children: [
            { index: true, lazy: page(() => import('./pages/home'), 'HomePage') },
            { path: 'blocks', lazy: page(comingSoon, 'BlocksPage') },
            { path: 'themes', lazy: page(comingSoon, 'ThemesPage') },
            { path: 'templates', lazy: page(comingSoon, 'TemplatesPage') },
            { path: 'changelog', lazy: page(comingSoon, 'ChangelogPage') },
          ],
        },
        {
          element: <DocsLayout />,
          children: [
            {
              path: 'components',
              handle: { wide: true } satisfies DocsRouteHandle,
              lazy: page(() => import('./pages/gallery'), 'GalleryPage'),
            },
            { path: 'components/:slug', lazy: page(() => import('./pages/doc-page'), 'DocPage') },
            { path: 'docs', lazy: page(() => import('./pages/docs-index'), 'DocsIndexPage') },
            { path: 'docs/:slug', lazy: page(() => import('./pages/guide'), 'GuidePage') },
            {
              path: 'getting-started',
              lazy: page(() => import('./pages/getting-started'), 'GettingStartedPage'),
            },
            { path: '*', lazy: page(() => import('./pages/not-found'), 'NotFoundPage') },
          ],
        },
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
