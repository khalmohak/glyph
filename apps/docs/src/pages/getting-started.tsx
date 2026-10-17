import { Code, Eyebrow, Heading, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@glyphui/ui'
import type { ReactNode } from 'react'
import { Snippet } from '../components/snippet'

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 sm:grid-cols-[2.5rem_1fr]">
      <span className="flex size-8 items-center justify-center rounded-pill border-(length:--glyph-border-width) border-border font-mono text-caption text-muted-foreground">
        {n}
      </span>
      <div className="grid min-w-0 gap-3">
        <Heading level={2} size="h4">
          {title}
        </Heading>
        {children}
      </div>
    </section>
  )
}

function Block({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border-(length:--glyph-border-width) border-border bg-subtle p-4 font-mono text-[0.8125rem] leading-relaxed text-foreground">
      <code>{code.trim()}</code>
    </pre>
  )
}

const tanstackRouter = `
// glyph-router.tsx
import type { GlyphRouter } from '@glyphui/ui'
import { Link, useLocation } from '@tanstack/react-router'

export const tanstackRouter: GlyphRouter = {
  Link: ({ href, ...props }) => <Link to={href} {...props} />,
  useIsActive: (href, { end } = {}) => {
    const pathname = useLocation({ select: (location) => location.pathname })
    return end ? pathname === href : pathname === href || pathname.startsWith(\`\${href}/\`)
  },
}

// <GlyphProvider router={tanstackRouter}>`

const nextRouter = `
// glyph-router.tsx
'use client'
import type { GlyphRouter } from '@glyphui/ui'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

export const nextRouter: GlyphRouter = {
  Link: NextLink,
  useIsActive: (href, { end } = {}) => {
    const pathname = usePathname()
    return end ? pathname === href : pathname === href || pathname.startsWith(\`\${href}/\`)
  },
}

// <GlyphProvider router={nextRouter}> in a client component, e.g. app/providers.tsx`

export function GettingStartedPage() {
  return (
    <div className="grid gap-10">
      <header className="grid gap-3">
        <Eyebrow>Guide</Eyebrow>
        <Heading level={1}>Getting started</Heading>
        <Text size="lead" tone="muted" className="max-w-2xl">
          Five steps from an empty React app to a themed one. Requires React 19 and Tailwind CSS 4.1
          or later.
        </Text>
      </header>

      <Step n={1} title="Install">
        <Snippet code="npm install @glyphui/ui" />
        <Text size="small" tone="muted">
          Optional packages, only for what you use:
        </Text>
        <Snippet code="npm install @glyphui/blocks" />
        <Text size="small" tone="muted">
          Page sections: Hero, Pricing, FAQ, AuthCard and more.
        </Text>
        <Text size="small" tone="muted">
          Every <Code>@glyphui</Code> package is released with the same version number, so keep them
          in step. Blocks, auth and viewers use your app's <Code>@glyphui/ui</Code> as a peer
          dependency instead of bringing their own copy.
        </Text>
        <Snippet code="npm install react-hook-form @hookform/resolvers zod @tanstack/react-table@8" />
        <Text size="small" tone="muted">
          Forms and data tables. The data table needs TanStack Table version 8; version 9 is not
          supported yet.
        </Text>
        <Snippet code="npm install recharts" />
        <Text size="small" tone="muted">
          Charts from <Code>@glyphui/ui/chart</Code>.
        </Text>
      </Step>

      <Step n={2} title="Import the styles">
        <Text tone="muted">In your main CSS file, in this order:</Text>
        <Block
          code={`
@import "@glyphui/ui/fonts.css";     /* Geist and Geist Mono, used by the default theme */
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/blocks/styles.css"; /* only if you installed @glyphui/blocks */`}
        />
        <Text size="small" tone="muted">
          Each Glyph stylesheet tells Tailwind which classes its components use. Without the blocks
          line, blocks render partly unstyled; in development they warn in the console. Skip the
          fonts line if your theme uses other fonts, and load those instead.
        </Text>
      </Step>

      <Step n={3} title="Create your theme file">
        <Text tone="muted">
          Start from a preset and override what differs. Everything is type-checked, including
          per-component defaults.
        </Text>
        <Block
          code={`
// glyph.theme.ts
import { defineTheme, presets } from '@glyphui/ui'

export default defineTheme({
  name: 'acme',
  extends: presets.glyph, // glyph · brutalist · editorial · playful
  colors: { dark: { primary: 'oklch(70% 0.19 45)', 'chart-1': 'oklch(70% 0.19 45)' } },
  radius: { md: '6px' },
  components: { Button: { defaultVariants: { size: 'lg' } } },
})`}
        />
      </Step>

      <Step n={4} title="Wrap your app">
        <Block
          code={`
import { GlyphProvider } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'
import theme from './glyph.theme'

createRoot(root).render(
  <BrowserRouter>
    <GlyphProvider theme={theme} defaultMode="system" router={reactRouter} toaster>
      <App />
    </GlyphProvider>
  </BrowserRouter>,
)`}
        />
        <Text size="small" tone="muted">
          <Code>router</Code> is optional. With it, every Glyph link navigates client-side, and
          Sidebar, Navbar and NavigationMenu items mark the current page automatically (pass{' '}
          <Code>end</Code> on an index item such as <Code>/app</Code>). <Code>toaster</Code> mounts
          the toast container so <Code>toast()</Code> works anywhere.
        </Text>
        <Text size="small" tone="muted">
          Another router? Pass an object with its <Code>Link</Code> and a <Code>useIsActive</Code>{' '}
          hook:
        </Text>
        <Tabs defaultValue="tanstack">
          <TabsList>
            <TabsTrigger value="tanstack">TanStack Router</TabsTrigger>
            <TabsTrigger value="next">Next.js</TabsTrigger>
          </TabsList>
          <TabsContent value="tanstack">
            <Block code={tanstackRouter} />
          </TabsContent>
          <TabsContent value="next">
            <Block code={nextRouter} />
          </TabsContent>
        </Tabs>
      </Step>

      <Step n={5} title="Prevent the dark-mode flash">
        <Text tone="muted">
          A tiny script sets the color mode before React loads. With Vite, add the plugin:
        </Text>
        <Block
          code={`
// vite.config.ts
import { glyphColorMode } from '@glyphui/ui/vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), glyphColorMode({ defaultMode: 'system' })],
})`}
        />
        <Text size="small" tone="muted">
          Pass the same <Code>defaultMode</Code> and <Code>storageKey</Code> as{' '}
          <Code>GlyphProvider</Code>. With an SSR framework, render{' '}
          <Code>{'<ColorModeScript />'}</Code> in the document head instead. Anywhere else, inline
          the string from <Code>getColorModeScript()</Code> in a head script tag.
        </Text>
      </Step>
    </div>
  )
}
