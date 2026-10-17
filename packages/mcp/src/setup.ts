import type { Manifest } from './manifest'

/** Glyph packages; `ui` is always installed. */
export const setupPackages = ['ui', 'blocks', 'auth', 'viewers'] as const
/** `@glyphui/ui` entries that need third-party packages. */
export const setupFeatures = ['forms', 'data-table', 'charts'] as const
type SetupFeature = Exclude<(typeof setupPackages)[number], 'ui'> | (typeof setupFeatures)[number]

export interface SetupOptions {
  framework: 'vite' | 'next' | 'other'
  packages?: readonly (typeof setupPackages)[number][]
  features?: readonly (typeof setupFeatures)[number][]
  /** Defaults to react-router for Vite and other setups, none for Next.js. */
  router?: 'react-router' | 'none' | undefined
}

/** Third-party peers each feature needs, matching the getting-started guide. */
const featurePeers: Record<SetupFeature, string[]> = {
  blocks: [],
  auth: [],
  viewers: [],
  forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
  'data-table': ['@tanstack/react-table@8'],
  charts: ['recharts'],
}

const featurePackage: Partial<Record<SetupFeature, string>> = {
  blocks: '@glyphui/blocks',
  auth: '@glyphui/auth',
  viewers: '@glyphui/viewers',
}

/** Extra packages per viewer, from the viewers README. */
const viewerPeers: [entry: string, component: string, install: string][] = [
  ['@glyphui/viewers/pdf', 'PdfViewer', 'pdfjs-dist'],
  [
    '@glyphui/viewers/csv',
    'CsvViewer',
    'papaparse @tanstack/react-table@8 @tanstack/react-virtual',
  ],
  [
    '@glyphui/viewers/spreadsheet',
    'SpreadsheetViewer',
    'read-excel-file @tanstack/react-table@8 @tanstack/react-virtual',
  ],
  ['@glyphui/viewers/json', 'JsonViewer', '(none)'],
  ['@glyphui/viewers/code', 'CodeViewer', 'shiki'],
  ['@glyphui/viewers/markdown', 'MarkdownViewer', 'react-markdown remark-gfm shiki'],
  ['@glyphui/viewers/diff', 'DiffViewer', 'diff'],
  ['@glyphui/viewers/media', 'ImageViewer, VideoPlayer, AudioPlayer', '(none)'],
]

/** The packages to install for a set of features, with required Glyph peers resolved. */
export function installList(
  m: Manifest,
  features: readonly SetupFeature[],
  router: SetupOptions['router'],
): string[] {
  const install = new Set(['@glyphui/ui'])
  for (const f of features) {
    const pkg = featurePackage[f]
    if (pkg) install.add(pkg)
    for (const peer of featurePeers[f]) install.add(peer)
  }
  // Required @glyphui/* peers (auth needs blocks and tokens, for example).
  for (const name of [...install]) {
    const pkg = m.packages.find((p) => p.name === name)
    for (const peer of pkg?.peers ?? [])
      if (!peer.optional && peer.name.startsWith('@glyphui/')) install.add(peer.name)
  }
  if (router === 'react-router') install.add('react-router')
  // Glyph's packages first, then their third-party peers.
  const glyph = (name: string) => (name.startsWith('@glyphui/') ? 0 : 1)
  return [...install].sort((a, b) => glyph(a) - glyph(b))
}

export function setupMarkdown(m: Manifest, options: SetupOptions): string {
  const features: SetupFeature[] = [
    ...(options.packages ?? []).filter((p) => p !== 'ui'),
    ...(options.features ?? []),
  ]
  const router = options.router ?? (options.framework === 'next' ? 'none' : 'react-router')
  const has = (f: SetupFeature) => features.includes(f)
  const out = [
    `# Set up Glyph ${m.version}${options.framework === 'next' ? ' with Next.js' : options.framework === 'vite' ? ' with Vite' : ''}`,
    '',
    'Requires React 19 and Tailwind CSS 4.1 or later. Every `@glyphui/*` package shares one version; keep them in step.',
    '',
    '## 1. Install',
    '',
    '```sh',
    `npm install ${installList(m, features, router).join(' ')}`,
  ]
  if (options.framework === 'vite') out.push('npm install -D tailwindcss @tailwindcss/vite')
  if (options.framework === 'next') out.push('npm install -D tailwindcss @tailwindcss/postcss')
  out.push('```')

  if (has('viewers')) {
    out.push(
      '',
      'Each viewer is its own import with its own optional dependencies. Install only what you use:',
      '',
      '| Import | Component | Also install |',
      '|---|---|---|',
      ...viewerPeers.map(
        ([entry, comp, peers]) =>
          `| \`${entry}\` | ${comp} | ${peers === '(none)' ? 'nothing' : `\`${peers}\``} |`,
      ),
    )
  }

  out.push(
    '',
    '## 2. Styles',
    '',
    'In your main CSS file, in this order:',
    '',
    '```css',
    '@import "@glyphui/ui/fonts.css"; /* Geist, used by the default theme */',
    '@import "tailwindcss";',
    '@import "@glyphui/ui/styles.css";',
    ...(has('blocks') || has('auth') ? ['@import "@glyphui/blocks/styles.css";'] : []),
    ...(has('auth') ? ['@import "@glyphui/auth/styles.css";'] : []),
    ...(has('viewers') ? ['@import "@glyphui/viewers/styles.css";'] : []),
    '```',
    '',
    'Each Glyph stylesheet tells Tailwind which classes its components use; leaving one out renders those components partly unstyled.',
  )

  if (options.framework === 'vite') {
    out.push(
      '',
      '## 3. Vite config',
      '',
      'The `glyphColorMode` plugin sets the color mode before React loads, so dark-mode visitors never see a light flash.',
      '',
      '```ts',
      "import { glyphColorMode } from '@glyphui/ui/vite'",
      "import tailwindcss from '@tailwindcss/vite'",
      "import react from '@vitejs/plugin-react'",
      "import { defineConfig } from 'vite'",
      '',
      'export default defineConfig({',
      "  plugins: [react(), tailwindcss(), glyphColorMode({ defaultMode: 'system' })],",
      '})',
      '```',
    )
  } else if (options.framework === 'next') {
    out.push(
      '',
      '## 3. Next.js',
      '',
      "Glyph's built files start with `'use client'`. Put the providers in a client component and the color-mode script in `<head>`:",
      '',
      '```tsx',
      '// app/layout.tsx',
      "import { ColorModeScript } from '@glyphui/ui'",
      "import { Providers } from './providers'",
      "import './globals.css'",
      '',
      'export default function RootLayout({ children }: { children: React.ReactNode }) {',
      '  return (',
      '    <html lang="en" suppressHydrationWarning>',
      '      <head>',
      '        <ColorModeScript defaultMode="system" />',
      '      </head>',
      '      <body>',
      '        <Providers>{children}</Providers>',
      '      </body>',
      '    </html>',
      '  )',
      '}',
      '```',
      '',
      '`app/providers.tsx` is a client component with the provider tree below. To make Glyph links use `next/link` and mark the active item, pass `router={nextRouter}` built as in `get_guide` "routing".',
    )
  } else {
    out.push(
      '',
      '## 3. Color mode',
      '',
      'Set the color mode before React loads: with Vite use `glyphColorMode()` from `@glyphui/ui/vite`; with server rendering render `<ColorModeScript />` in `<head>`.',
    )
  }

  out.push(
    '',
    '## 4. Theme file',
    '',
    '```ts',
    options.framework === 'next' ? '// glyph.theme.ts (next to app/)' : '// src/glyph.theme.ts',
    "import { defineTheme, presets } from '@glyphui/ui'",
    '',
    'export default defineTheme({',
    "  name: 'acme',",
    '  extends: presets.glyph, // glyph · brutalist · editorial · playful',
    "  colors: { dark: { primary: 'oklch(70% 0.19 45)' } },",
    '})',
    '```',
    '',
    '## 5. Providers',
    '',
    'Outermost first: `GlyphProvider`, then `AuthProvider` (with auth), then the router.',
    '',
    '```tsx',
  )

  const reactRouter = router === 'react-router'
  const imports = [
    ...(has('auth')
      ? [
          "import { AuthProvider, createAuthClient } from '@glyphui/auth'",
          "import { restAdapter } from '@glyphui/auth/rest'",
        ]
      : []),
    ...(has('auth') && reactRouter
      ? [
          "import { AuthRevalidator, guestLoader, protectedLoader } from '@glyphui/auth/react-router'",
        ]
      : []),
    ...(has('auth') ? ["import { SessionExpiredDialog } from '@glyphui/auth/ui'"] : []),
    "import { GlyphProvider } from '@glyphui/ui'",
    ...(reactRouter ? ["import { reactRouter } from '@glyphui/ui/react-router'"] : []),
    ...(options.framework === 'next' ? [] : ["import { createRoot } from 'react-dom/client'"]),
    ...(reactRouter
      ? ["import { createBrowserRouter, Outlet, RouterProvider } from 'react-router'"]
      : []),
    options.framework === 'next'
      ? "import theme from '../glyph.theme'"
      : "import theme from './glyph.theme'",
    ...(options.framework === 'next' ? [] : ["import './index.css'"]),
  ]
  out.push(...(options.framework === 'next' ? ["'use client'"] : []), ...imports, '')
  if (has('auth')) {
    out.push(
      '// Your API sets an httpOnly session cookie; see get_guide "auth" for bearer tokens.',
      "const auth = createAuthClient(restAdapter({ baseUrl: '/api' }))",
      '',
    )
  }
  if (reactRouter) {
    out.push(
      'const router = createBrowserRouter([',
      '  {',
      has('auth')
        ? '    element: (<><AuthRevalidator /><Outlet /></>),'
        : '    element: <Outlet />,',
      '    children: [',
      has('auth')
        ? "      { path: 'sign-in', loader: guestLoader(auth, { redirectTo: '/' }), element: <SignInPage /> },\n      { index: true, loader: protectedLoader(auth), element: <HomePage /> },"
        : '      { index: true, element: <HomePage /> },',
      '    ],',
      '  },',
      '])',
      '',
    )
  }
  const inner = reactRouter ? '<RouterProvider router={router} />' : '<App />'
  const tree = has('auth')
    ? [
        `    <AuthProvider client={auth}>`,
        `      ${inner}`,
        '      <SessionExpiredDialog />',
        '    </AuthProvider>',
      ]
    : [`    ${inner}`]
  const providerProps = `theme={theme} defaultMode="system"${reactRouter ? ' router={reactRouter}' : ''} toaster`
  if (options.framework === 'next') {
    out.push(
      'export function Providers({ children }: { children: React.ReactNode }) {',
      '  return (',
      `    <GlyphProvider ${providerProps}>`,
      ...(has('auth')
        ? [
            '      <AuthProvider client={auth}>',
            '        {children}',
            '        <SessionExpiredDialog />',
            '      </AuthProvider>',
          ]
        : ['      {children}']),
      '    </GlyphProvider>',
      '  )',
      '}',
    )
  } else {
    out.push(
      "createRoot(document.getElementById('root') as HTMLElement).render(",
      `  <GlyphProvider ${providerProps}>`,
      ...tree,
      '  </GlyphProvider>,',
      ')',
    )
  }
  out.push(
    '```',
    '',
    '- `router` makes Glyph links navigate client-side and marks the current Sidebar, Navbar and NavigationMenu item.',
    '- `toaster` mounts the toast container so `toast()` works anywhere; `useConfirm()` needs no setup.',
    '',
    '## Next',
    '',
    `- Guides: ${m.guides.map((g) => `\`${g.slug}\``).join(', ')} (open with \`get_guide\`).`,
    `- Components: \`list_components\`, \`search_docs\`, \`get_component\`.`,
    `- Docs: ${m.site.url}/docs/getting-started`,
  )
  return out.join('\n')
}
