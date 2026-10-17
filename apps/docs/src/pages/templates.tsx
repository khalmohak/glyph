import {
  Badge,
  Button,
  Card,
  Container,
  Eyebrow,
  Heading,
  Reveal,
  Stagger,
  Text,
} from '@glyphui/ui'
import { ArrowUpRight, Github } from 'lucide-react'
import { Link } from 'react-router'
import { AUTH_URL, DEMO_URL, REPO_URL } from '../lib/site'

interface Template {
  name: string
  description: string
  image: string
  /** Opens the running app. Internal paths stay in the docs; others open the deployed app. */
  live: { href: string; internal?: boolean }
  source: string
  tags: string[]
  uses: { label: string; slug: string }[]
}

const templates: Template[] = [
  {
    name: 'Ledgerline',
    description:
      'A billing SaaS: a dashboard with charts, a server-side invoices table with URL state, filter chips and bulk actions, forms in modals, a customer sheet and a ⌘K menu.',
    image: 'templates/ledgerline.jpg',
    live: { href: `${DEMO_URL}/` },
    source: `${REPO_URL}/tree/main/apps/demo-saas`,
    tags: ['SaaS dashboard', 'Data tables', 'Charts'],
    uses: [
      { label: 'AppShell', slug: 'app-shell' },
      { label: 'DataTable', slug: 'data-table' },
      { label: 'Charts', slug: 'chart' },
      { label: 'Modal', slug: 'modal' },
      { label: 'Form', slug: 'form' },
      { label: 'Sheet', slug: 'sheet' },
      { label: 'CommandMenu', slug: 'command-menu' },
    ],
  },
  {
    name: 'Auth example',
    description:
      'Sign-up with an emailed code, two-step sign-in, protected routes with redirect-back, roles, organizations, an expiring session and cross-tab sign-out, against a REST API.',
    image: 'templates/auth.jpg',
    live: { href: `${AUTH_URL}/` },
    source: `${REPO_URL}/tree/main/apps/auth-example`,
    tags: ['Authentication', 'React Router'],
    uses: [
      { label: 'Auth provider', slug: 'auth' },
      { label: 'SignInForm', slug: 'sign-in-form' },
      { label: 'AuthLayout', slug: 'auth-layout' },
      { label: 'Protected routes', slug: 'protected-routes' },
      { label: 'UserMenu', slug: 'user-menu' },
      { label: 'Session dialogs', slug: 'session-dialogs' },
    ],
  },
  {
    name: 'File browser',
    description:
      'Preview anything people upload: PDFs with search and thumbnails, CSV and spreadsheets as tables, JSON trees, highlighted code, Markdown, images, audio and video.',
    image: 'templates/viewers.jpg',
    live: { href: '/templates/viewers', internal: true },
    source: `${REPO_URL}/tree/main/apps/docs/src/pages/viewers-template.tsx`,
    tags: ['File viewers'],
    uses: [
      { label: 'FilePreview', slug: 'file-preview' },
      { label: 'PdfViewer', slug: 'pdf-viewer' },
      { label: 'CsvViewer', slug: 'csv-viewer' },
      { label: 'SpreadsheetViewer', slug: 'spreadsheet-viewer' },
      { label: 'JsonViewer', slug: 'json-viewer' },
      { label: 'CodeViewer', slug: 'code-viewer' },
      { label: 'VideoPlayer', slug: 'video-player' },
    ],
  },
]

/** Complete apps built only with Glyph, each with a live demo and its source. */
export function TemplatesPage() {
  return (
    <Container size="xl" className="grid gap-12 py-10 sm:py-14">
      <Reveal className="grid max-w-2xl gap-3">
        <Eyebrow>Templates</Eyebrow>
        <Heading level={1}>Real apps, built only with Glyph</Heading>
        <Text size="lead" tone="muted">
          Open a running app, then read how it's made. Each one uses the published packages and runs
          against its own API, so what you see is what you get.
        </Text>
      </Reveal>
      <Stagger as="ul" className="grid gap-6 lg:grid-cols-3" aria-label="Templates">
        {templates.map((template) => (
          <li key={template.name} className="flex">
            <TemplateCard template={template} />
          </li>
        ))}
      </Stagger>
    </Container>
  )
}

function TemplateCard({ template }: { template: Template }) {
  const live = template.live.internal ? (
    <Link to={template.live.href}>Open</Link>
  ) : (
    <a href={template.live.href}>Live demo</a>
  )
  return (
    <Card padding="none" className="flex w-full flex-col overflow-hidden">
      <div className="aspect-[16/10] overflow-hidden border-b border-border bg-subtle">
        <img
          src={`${import.meta.env.BASE_URL}${template.image}`}
          alt={`Screenshot of ${template.name}`}
          loading="lazy"
          className="size-full object-cover object-top"
        />
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
          <Heading level={2} size="h4">
            {template.name}
          </Heading>
          <Text size="small" tone="muted">
            {template.description}
          </Text>
        </div>
        <div className="grid gap-2">
          <Text size="small" weight="medium">
            What it uses
          </Text>
          <ul className="flex flex-wrap gap-1.5" aria-label={`Components in ${template.name}`}>
            {template.uses.map((use) => (
              <li key={use.slug}>
                <Link
                  to={`/components/${use.slug}`}
                  className="inline-flex rounded-md border border-border px-2 py-0.5 font-mono text-caption text-muted-foreground hover:border-border-strong hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {use.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Button size="sm" rightIcon={<ArrowUpRight />} asChild>
            {live}
          </Button>
          <Button size="sm" variant="outline" leftIcon={<Github />} asChild>
            <a href={template.source}>Source</a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
