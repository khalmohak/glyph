import { Cta, Faq, FeatureGrid } from '@glyphui/blocks'
import {
  AnimatedNumber,
  Badge,
  Button,
  Card,
  CodeBlock,
  Container,
  Eyebrow,
  Heading,
  type PresetName,
  presets,
  Reveal,
  SegmentedControl,
  Skeleton,
  Stagger,
  Text,
  ThemeScope,
} from '@glyphui/ui'
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  FileStack,
  FileText,
  KeyRound,
  LayoutDashboard,
  LineChart,
  ListChecks,
  PanelsTopLeft,
  ScrollText,
  Sparkles,
  Table2,
} from 'lucide-react'
import { lazy, type ReactNode, Suspense, useState } from 'react'
import { Link } from 'react-router'
import { AgentPrompt } from '../components/agent-prompt'
import { BrowserFrame } from '../components/home/browser-frame'
import { ThemeTeaser } from '../components/home/theme-teaser'
import { Snippet } from '../components/snippet'
import { AGENTS_BLOCK } from '../lib/agent-setup'
import { docs } from '../lib/catalog'
import { AUTH_URL, DEMO_URL, homeFaq } from '../lib/site'
import { version } from '../lib/version'
import { presetLabel, presetNames } from '../shell/theme-controls'
import { useThemeChoice } from '../theme-choice'

// The mock pulls in the data table and charts; load it after the page itself.
const ProductMock = lazy(() =>
  import('../components/home/product-mock').then((m) => ({ default: m.ProductMock })),
)

const exampleCount = docs.reduce((sum, doc) => sum + (doc.examples?.length ?? 0), 0)

/** Published packages, each its own install. */
const packages = ['tokens', 'ui', 'blocks', 'auth', 'viewers', 'mcp']

const MCP_COMMAND = 'claude mcp add glyph -- npx -y @glyphui/mcp'

/** The tools @glyphui/mcp exposes, as listed in the AI guide. */
const mcpTools = ['get_setup', 'get_component', 'search_docs', 'get_example', 'get_theming']

export function HomePage() {
  return (
    <>
      <Hero />
      <Section>
        <StatsStrip />
      </Section>
      <AgentsSection />
      <FeatureGrid
        eyebrow="What's in the box"
        title="Everything a SaaS needs, already solved"
        description="Not just buttons. The screens every product rebuilds come ready: forms with server errors, server-side tables, charts, auth and file previews."
        columns={4}
        features={[
          {
            icon: <ListChecks />,
            title: 'Forms',
            description:
              'Schema-validated fields, server errors on the right field, submit states.',
            href: '/components/form',
          },
          {
            icon: <Table2 />,
            title: 'Data tables',
            description:
              'Server mode, filter chips, URL state, bulk actions, 10k-row virtualization.',
            href: '/components/data-table',
          },
          {
            icon: <LineChart />,
            title: 'Charts',
            description: 'Line, area, bar, pie, funnel, heatmap, sankey and gauges on your tokens.',
            href: '/components/chart',
          },
          {
            icon: <KeyRound />,
            title: 'Auth',
            description: 'Sessions, protected routes and sign-in screens for your own REST API.',
            href: '/components/auth',
          },
          {
            icon: <FileStack />,
            title: 'File viewers',
            description: 'PDF, CSV, spreadsheets, JSON, code, Markdown, diffs and media.',
            href: '/components/file-preview',
          },
          {
            icon: <PanelsTopLeft />,
            title: 'App layout',
            description: 'Sidebar, navbar, page headers and a mobile drawer, router-aware.',
            href: '/components/app-shell',
          },
          {
            icon: <LayoutDashboard />,
            title: 'Page blocks',
            description: 'Hero, pricing, FAQ, testimonials and footers for marketing pages.',
            href: '/blocks',
          },
          {
            icon: <Sparkles />,
            title: 'Motion',
            description: 'Springs, sliding indicators and reveals, with reduced motion respected.',
            href: '/components/motion',
          },
        ]}
      />
      <Section>
        <SectionHeading
          eyebrow="Theming"
          title="One theme file. Four very different products."
          description="Color, type, shape, depth, density and motion all come from a typed theme. These are the same components, unchanged, under the four built-in presets."
          action={
            <Button variant="outline" rightIcon={<ArrowRight />} asChild>
              <Link to="/themes">Open the theme studio</Link>
            </Button>
          }
        />
        <Reveal>
          <ThemeTeaser />
        </Reveal>
      </Section>
      <Section>
        <SectionHeading
          eyebrow="Setup"
          title="Running in three steps"
          description="Works with Vite, Next.js and any React 19 app on Tailwind CSS 4."
        />
        <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
          <Step n={1} title="Install">
            <CodeBlock language="sh" code="npm install @glyphui/ui" />
          </Step>
          <Step n={2} title="Import the styles">
            <CodeBlock
              title="index.css"
              code={
                '@import "@glyphui/ui/fonts.css";\n@import "tailwindcss";\n@import "@glyphui/ui/styles.css";'
              }
            />
          </Step>
          <Step n={3} title="Wrap your app">
            <CodeBlock
              title="main.tsx"
              code={
                "import { GlyphProvider, presets }\n  from '@glyphui/ui'\n\n<GlyphProvider theme={presets.glyph}>\n  <App />\n</GlyphProvider>"
              }
            />
          </Step>
        </Stagger>
      </Section>
      <Section>
        <SectionHeading
          eyebrow="Templates"
          title="See it in real apps"
          description="Two complete apps built only with Glyph, running against their own APIs."
        />
        <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
          <DemoCard
            title="Ledgerline"
            description="A billing SaaS: dashboard charts, a server-side invoices table with URL state and bulk actions, forms in modals, and a ⌘K menu."
            href={`${DEMO_URL}/`}
            uses={['AppShell', 'DataTable', 'Charts', 'Modal', 'Form', 'CommandMenu']}
          />
          <DemoCard
            title="Auth example"
            description="Sign-up with an emailed code, protected routes with redirect-back, roles, organizations and an expiring session."
            href={`${AUTH_URL}/`}
            uses={['AuthProvider', 'SignInForm', 'RequireAuth', 'UserMenu', 'OrganizationSwitcher']}
          />
        </Stagger>
      </Section>
      <Faq
        eyebrow="FAQ"
        title="Common questions about Glyph"
        layout="split"
        items={homeFaq.map((entry) => ({ question: entry.question, answer: entry.answer }))}
      />
      <Cta
        title="Give your agent a UI library it can look up"
        description={`Glyph ${version} is MIT licensed and on npm, with its MCP server released alongside.`}
        actions={
          <>
            <Button size="lg" rightIcon={<ArrowRight />} asChild>
              <Link to="/docs/getting-started">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/docs/ai">Set up your agent</Link>
            </Button>
          </>
        }
      />
    </>
  )
}

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={['py-10 sm:py-14', className].filter(Boolean).join(' ')}>
      {/* minmax(0, 1fr): wide content (code in a wide mono font) scrolls instead of widening the page. */}
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-8">{children}</Container>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="grid max-w-2xl gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading level={2} size="h2">
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </div>
      {action}
    </Reveal>
  )
}

function Hero() {
  const { theme: siteTheme, setTheme } = useThemeChoice()
  // Starts on the site's theme; the switcher previews the others without leaving the page.
  const [preset, setPreset] = useState<PresetName>(siteTheme)

  return (
    <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-48 h-[40rem] bg-[radial-gradient(45%_45%_at_50%_40%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent)]"
      />
      <Container className="relative grid grid-cols-[minmax(0,1fr)] gap-12">
        <Reveal className="mx-auto grid max-w-3xl justify-items-center gap-6 text-center">
          <Badge tone="primary" dot asChild>
            <Link to="/docs/ai">v{version} · Built for AI coding agents, MCP server included</Link>
          </Badge>
          <Heading level={1} size="display" className="text-balance">
            The UI library built for coding agents.
          </Heading>
          <Text size="lead" tone="muted" className="max-w-2xl text-pretty">
            Glyph is a React and Tailwind CSS v4 library your agent looks up instead of guessing. An
            MCP server and Markdown docs give Claude Code, Cursor and Codex the real props and
            examples. Forms, data tables, charts, auth and file viewers come solved, and one typed
            theme file decides how all of it looks.
          </Text>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" rightIcon={<ArrowRight />} asChild>
              <Link to="/docs/getting-started">Get started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/docs/ai">Set up your agent</Link>
            </Button>
          </div>
          <div className="grid w-full max-w-md gap-2">
            <Snippet code="npm install @glyphui/ui" />
            <Snippet code={MCP_COMMAND} />
          </div>
        </Reveal>

        <Reveal scale delay={120} className="grid gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SegmentedControl<PresetName>
              aria-label="Preview theme"
              size="sm"
              value={preset}
              onValueChange={setPreset}
              options={presetNames.map((name) => ({ value: name, label: presetLabel(name) }))}
            />
            {preset !== siteTheme && (
              <Button variant="ghost" size="sm" onClick={() => setTheme(preset)}>
                Use {presetLabel(preset)} for the whole site
              </Button>
            )}
          </div>
          <BrowserFrame url="ledgerline.app/invoices">
            <ThemeScope theme={presets[preset]} className="h-[680px] lg:h-[760px]">
              <Suspense fallback={<MockSkeleton />}>
                <ProductMock themeName={presets[preset].name} />
              </Suspense>
            </ThemeScope>
          </BrowserFrame>
          <Text size="small" tone="muted" className="text-center">
            Live, not a screenshot: filter the table, hover the chart, or create an invoice.
          </Text>
        </Reveal>
      </Container>
    </section>
  )
}

function AgentsSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Built for agents"
        title="Your agent reads the docs before it writes the code"
        description="Agents guess when all they have is training data. Glyph gives them the API for the exact version you installed, in the form each agent reads best."
        action={
          <Button variant="outline" rightIcon={<ArrowRight />} asChild>
            <Link to="/docs/ai">Agent setup guide</Link>
          </Button>
        }
      />
      <Reveal className="grid gap-3">
        <Heading level={3} size="h4">
          Set up with one prompt
        </Heading>
        <Text tone="muted">
          Paste it into your agent in your project. It connects the MCP server, installs Glyph and
          adds the project instructions.
        </Text>
        <AgentPrompt />
      </Reveal>
      <Stagger className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
        <AgentCard
          icon={<Bot />}
          title="MCP server"
          description="Props, examples, setup and theming as tools, bundled for your Glyph version. Works offline in Claude Code, Cursor, VS Code, Codex and Windsurf."
        >
          <Snippet code={MCP_COMMAND} />
          <ul className="flex flex-wrap gap-1.5" aria-label="Tools">
            {mcpTools.map((tool) => (
              <li key={tool}>
                <Badge variant="outline" className="font-mono">
                  {tool}
                </Badge>
              </li>
            ))}
          </ul>
        </AgentCard>
        <AgentCard
          icon={<FileText />}
          title="llms.txt and Markdown"
          description="For agents that read the web: an index, the whole docs in one file, and every page as Markdown at its URL plus .md, or with Accept: text/markdown."
        >
          <ul className="grid gap-1.5 font-mono text-small">
            {['/llms.txt', '/llms-full.txt', '/components/data-table.md'].map((path) => (
              <li key={path}>
                <a href={path} className="text-primary underline-offset-4 hover:underline">
                  glyphui.xyz{path}
                </a>
              </li>
            ))}
          </ul>
        </AgentCard>
        <AgentCard
          icon={<ScrollText />}
          title="AGENTS.md"
          description="A few lines in your project's agent instructions keep every session on Glyph's conventions."
        >
          <CodeBlock title="AGENTS.md" language="md" wrap code={AGENTS_BLOCK} />
        </AgentCard>
      </Stagger>
    </Section>
  )
}

function AgentCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <Card className="h-full content-start gap-4">
      <div className="grid gap-2">
        <span className="grid size-9 place-items-center rounded-md bg-subtle text-primary [&_svg]:size-5">
          {icon}
        </span>
        <Heading level={3} size="h4">
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </div>
      {children}
    </Card>
  )
}

function MockSkeleton() {
  return (
    <div className="grid h-full grid-cols-[15rem_1fr] max-md:grid-cols-1">
      <div className="border-r-(length:--glyph-border-width) border-border bg-subtle max-md:hidden" />
      <div className="grid content-start gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

function StatsStrip() {
  const stats = [
    { value: docs.length, label: 'components and patterns' },
    { value: exampleCount, label: 'live examples' },
    { value: packages.length, label: 'packages, MCP server included' },
    { value: presetNames.length, label: 'built-in themes' },
  ]
  return (
    <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border-(length:--glyph-border-width) border-border bg-border lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="grid gap-1 bg-background p-6">
          <AnimatedNumber value={stat.value} className="font-display text-h1 tabular-nums" />
          <Text size="small" tone="muted">
            {stat.label}
          </Text>
        </div>
      ))}
    </Stagger>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <Card className="gap-4">
      <div className="flex items-center gap-3">
        <span className="grid size-7 place-items-center rounded-pill border-(length:--glyph-border-width) border-border font-mono text-caption text-muted-foreground">
          {n}
        </span>
        <Heading level={3} size="h4">
          {title}
        </Heading>
      </div>
      {children}
    </Card>
  )
}

function DemoCard({
  title,
  description,
  href,
  uses,
}: {
  title: string
  description: string
  href: string
  uses: readonly string[]
}) {
  return (
    <Card className="h-full gap-4">
      <div className="grid gap-2">
        <Heading level={3} size="h3">
          {title}
        </Heading>
        <Text tone="muted">{description}</Text>
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
        {uses.map((name) => (
          <li key={name}>
            <Badge variant="outline">{name}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <Button variant="outline" rightIcon={<ArrowUpRight />} asChild>
          <a href={href}>Open the live demo</a>
        </Button>
      </div>
    </Card>
  )
}
