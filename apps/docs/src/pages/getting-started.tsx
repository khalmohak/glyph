import { Eyebrow, Heading, Text } from '@glyphui/ui'
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
          For forms and data tables, also install their peer dependencies:
        </Text>
        <Snippet code="npm install react-hook-form @hookform/resolvers zod @tanstack/react-table" />
      </Step>

      <Step n={2} title="Import the styles">
        <Text tone="muted">After Tailwind, in your main CSS file:</Text>
        <Block
          code={`
@import "tailwindcss";
@import "@glyphui/ui/styles.css";`}
        />
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
  colors: { dark: { primary: 'oklch(70% 0.19 45)' } },
  radius: { md: '6px' },
  components: { Button: { defaultVariants: { size: 'lg' } } },
})`}
        />
      </Step>

      <Step n={4} title="Wrap your app">
        <Block
          code={`
import { GlyphProvider } from '@glyphui/ui'
import theme from './glyph.theme'

createRoot(root).render(
  <GlyphProvider theme={theme} defaultMode="system" linkComponent={RouterLink}>
    <App />
  </GlyphProvider>,
)`}
        />
        <Text size="small" tone="muted">
          linkComponent is optional. Pass your router's link so Navbar, Sidebar and Breadcrumb
          navigate client-side.
        </Text>
      </Step>

      <Step n={5} title="Prevent the dark-mode flash">
        <Text tone="muted">
          Put the color-mode script in your HTML head so the right mode applies before React loads.
          With an SSR framework, render {'<ColorModeScript />'} instead.
        </Text>
        <Block
          code={`
import { getColorModeScript } from '@glyphui/ui'
// <script>{getColorModeScript({ defaultMode: 'system' })}</script>`}
        />
      </Step>
    </div>
  )
}
