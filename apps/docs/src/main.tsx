import { GlyphProvider, LoadingState, type PresetName, presets } from '@glyphui/ui'
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

const presetNames = Object.keys(presets) as PresetName[]

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
      // A block on its own, without the site chrome, for the blocks gallery's iframes.
      path: 'blocks/frame/:slug/:file',
      hydrateFallbackElement: <LoadingState label="Loading" className="min-h-dvh" />,
      lazy: page(() => import('./pages/block-frame'), 'BlockFramePage'),
    },
    {
      element: <SiteLayout />,
      hydrateFallbackElement: <LoadingState label="Loading" className="min-h-dvh" />,
      children: [
        {
          element: <PageLayout />,
          children: [
            { index: true, lazy: page(() => import('./pages/home'), 'HomePage') },
            { path: 'blocks', lazy: page(() => import('./pages/blocks'), 'BlocksPage') },
            { path: 'themes', lazy: page(() => import('./pages/themes'), 'ThemesPage') },
            { path: 'templates', lazy: page(() => import('./pages/templates'), 'TemplatesPage') },
            {
              path: 'templates/viewers',
              lazy: page(() => import('./pages/viewers-template'), 'ViewersTemplatePage'),
            },
            { path: 'changelog', lazy: page(() => import('./pages/changelog'), 'ChangelogPage') },
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
            {
              path: 'components/:slug',
              // Wide: the component page has an "On this page" column on large screens.
              handle: { wide: true } satisfies DocsRouteHandle,
              lazy: page(() => import('./pages/doc-page'), 'DocPage'),
            },
            { path: 'docs', lazy: page(() => import('./pages/docs-index'), 'DocsIndexPage') },
            { path: 'docs/:slug', lazy: page(() => import('./pages/guide'), 'GuidePage') },
            {
              path: 'getting-started',
              lazy: page(() => import('./pages/guide'), 'GettingStartedGuide'),
            },
            { path: '*', lazy: page(() => import('./pages/not-found'), 'NotFoundPage') },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

// Block frames follow the site's theme and mode through shared storage. A direct link can pin
// them with ?theme= and ?mode=, which are not remembered.
const frame = /\/blocks\/frame\//.test(window.location.pathname)
const query = new URLSearchParams(window.location.search)
const fixedTheme = frame ? presetNames.find((name) => name === query.get('theme')) : undefined
const fixedMode = frame ? query.get('mode') : null
const pinnedMode = fixedMode === 'light' || fixedMode === 'dark' ? fixedMode : undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeChoiceProvider fixed={fixedTheme}>
      {(theme) => (
        <GlyphProvider
          theme={theme}
          defaultMode={pinnedMode ?? 'dark'}
          {...(pinnedMode && { storageKey: null })}
          router={reactRouter}
          toaster
        >
          <RouterProvider router={router} />
        </GlyphProvider>
      )}
    </ThemeChoiceProvider>
  </StrictMode>,
)
