/**
 * The site map: top-level sections, guides and the static routes the build prerenders.
 * Plain data with no browser or Vite imports, so the prerender plugin and the e2e suite can
 * read it in Node.
 */

export const SITE_NAME = 'Glyph'
export const REPO_URL = 'https://github.com/khalmohak/glyph'
export const NPM_URL = 'https://www.npmjs.com/package/@glyphui/ui'
/** The deployed site, for links that must leave this app (the demo apps live beside it). */
export const LIVE_URL = 'https://khalmohak.github.io/glyph'

export interface NavSection {
  label: string
  href: string
}

/** Primary navigation in the site header. */
export const sections: readonly NavSection[] = [
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/components' },
  { label: 'Blocks', href: '/blocks' },
  { label: 'Themes', href: '/themes' },
  { label: 'Templates', href: '/templates' },
]

export interface Guide {
  slug: string
  title: string
  description: string
  /** Until the guide is written, the component page that covers the topic. */
  seeAlso?: { label: string; href: string }
}

/** Guides under /docs, in reading order. */
export const guides: readonly Guide[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    description: 'Install Glyph, add a theme file, and wrap your app.',
  },
  {
    slug: 'theming',
    title: 'Theming',
    description: 'One typed theme file: colors, type, shape, depth, motion and component recipes.',
    seeAlso: { label: 'Theme reference', href: '/components/theme' },
  },
  {
    slug: 'motion',
    title: 'Motion',
    description: 'Motion levels, springs, reduced motion and the animation primitives.',
    seeAlso: { label: 'Motion', href: '/components/motion' },
  },
  {
    slug: 'routing',
    title: 'Routing',
    description: 'Connect React Router, TanStack Router or Next.js for links and active items.',
    seeAlso: { label: 'Router integration', href: '/components/router' },
  },
  {
    slug: 'forms',
    title: 'Forms',
    description: 'Schema-validated forms with server errors, in pages and modals.',
    seeAlso: { label: 'Form', href: '/components/form' },
  },
  {
    slug: 'data-tables',
    title: 'Data tables',
    description: 'Sorting, filters, server mode, URL state, bulk actions and virtualization.',
    seeAlso: { label: 'DataTable', href: '/components/data-table' },
  },
  {
    slug: 'auth',
    title: 'Authentication',
    description: 'Sessions, protected routes and sign-in screens against your own API.',
    seeAlso: { label: 'Auth provider', href: '/components/auth' },
  },
  {
    slug: 'viewers',
    title: 'File viewers',
    description: 'PDF, CSV, spreadsheets, JSON, code, Markdown, diffs and media.',
    seeAlso: { label: 'FilePreview', href: '/components/file-preview' },
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    description: 'What Glyph handles for you, and what each app still has to do.',
  },
  {
    slug: 'testing',
    title: 'Testing your app',
    description: 'Unit and end-to-end tests for screens built with Glyph.',
  },
  {
    slug: 'migration',
    title: 'Upgrading',
    description: 'Breaking changes and how to move between versions.',
    seeAlso: { label: 'Changelog', href: '/changelog' },
  },
]

export interface StaticRoute {
  /** Without leading or trailing slash; `''` is the home page. */
  path: string
  title: string
  description: string
}

const pageTitle = (title: string) => `${title} · ${SITE_NAME}`

/** Every route that isn't generated from the component catalog. */
export const staticRoutes: readonly StaticRoute[] = [
  {
    path: 'components',
    title: pageTitle('Components'),
    description: 'Every Glyph component with a live preview, its status, and the roadmap.',
  },
  {
    path: 'getting-started',
    title: pageTitle('Getting started'),
    description: 'Install Glyph, add a theme file, and wrap your app.',
  },
  {
    path: 'docs',
    title: pageTitle('Docs'),
    description: 'Guides to building apps with Glyph: theming, forms, tables, auth and more.',
  },
  ...guides.map((guide) => ({
    path: `docs/${guide.slug}`,
    title: pageTitle(guide.title),
    description: guide.description,
  })),
  {
    path: 'blocks',
    title: pageTitle('Blocks'),
    description: 'Page sections for marketing sites and apps, previewed at every screen size.',
  },
  {
    path: 'themes',
    title: pageTitle('Themes'),
    description: 'Design a Glyph theme on live components and export it as a theme file.',
  },
  {
    path: 'templates',
    title: pageTitle('Templates'),
    description: 'Complete example apps built with Glyph, with live demos and source.',
  },
  {
    path: 'changelog',
    title: pageTitle('Changelog'),
    description: 'What changed in each Glyph release.',
  },
]
