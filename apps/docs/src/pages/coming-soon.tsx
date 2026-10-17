import { Badge, Button, Card, Container, Eyebrow, Heading, Text } from '@glyphui/ui'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { LIVE_URL } from '../lib/site'

interface ComingSoonProps {
  eyebrow: string
  title: string
  description: string
  /** What the finished page will do, one item per line. */
  plans: readonly string[]
  /** Where to go meanwhile. */
  links?: readonly { label: string; href: string }[]
  /** Inside the docs layout (no container) or a full-width page. */
  inDocs?: boolean
}

/** A section that lands later in this release: what it will hold, and where to look now. */
export function ComingSoon({
  eyebrow,
  title,
  description,
  plans,
  links = [],
  inDocs,
}: ComingSoonProps) {
  const body: ReactNode = (
    <div className="grid gap-8">
      <header className="grid max-w-2xl gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>{eyebrow}</Eyebrow>
          <Badge tone="info" dot>
            Coming in this release
          </Badge>
        </div>
        <Heading level={1}>{title}</Heading>
        <Text size="lead" tone="muted">
          {description}
        </Text>
      </header>
      <Card className="max-w-2xl gap-3">
        <Text weight="medium">What this page will have</Text>
        <ul className="grid list-disc gap-1.5 pl-5 text-small text-muted-foreground">
          {plans.map((plan) => (
            <li key={plan}>{plan}</li>
          ))}
        </ul>
      </Card>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {links.map((link, i) => (
            <Button
              key={link.href}
              variant={i === 0 ? 'primary' : 'outline'}
              rightIcon={i === 0 ? <ArrowRight /> : undefined}
              asChild
            >
              {link.href.startsWith('http') ? (
                <a href={link.href}>{link.label}</a>
              ) : (
                <Link to={link.href}>{link.label}</Link>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
  if (inDocs) return body
  return <Container className="py-16 sm:py-24">{body}</Container>
}

export function BlocksPage() {
  return (
    <ComingSoon
      eyebrow="Blocks"
      title="Blocks"
      description="Ready-made page sections, previewed at phone, tablet and desktop sizes in every theme."
      plans={[
        'Every block in a resizable frame with phone, tablet and desktop presets',
        'Code for each block, and a theme switch per preview',
      ]}
      links={[
        { label: 'Hero', href: '/components/hero' },
        { label: 'Pricing', href: '/components/pricing' },
        { label: 'All components', href: '/components' },
      ]}
    />
  )
}

export function ThemesPage() {
  return (
    <ComingSoon
      eyebrow="Themes"
      title="Theme studio"
      description="Design a theme on live components, check its contrast, and export it as glyph.theme.ts."
      plans={[
        'Edit colors per mode, radius, fonts, shadows, density and motion',
        'A live board of components that follows every edit',
        'A contrast audit, and export as a copyable theme file',
      ]}
      links={[{ label: 'Theme reference', href: '/components/theme' }]}
    />
  )
}

export function TemplatesPage() {
  return (
    <ComingSoon
      eyebrow="Templates"
      title="Templates"
      description="Complete apps built with Glyph: open the live demo, then read the source."
      plans={[
        'Ledgerline, a SaaS billing app with server-side tables and charts',
        'An auth example with sign-up, verification, roles and session expiry',
        'Screenshots, the components each one uses, and links to the code',
      ]}
      links={[
        { label: 'Open the Ledgerline demo', href: `${LIVE_URL}/demo/` },
        { label: 'Open the auth example', href: `${LIVE_URL}/auth/` },
      ]}
    />
  )
}

export function ChangelogPage() {
  return (
    <ComingSoon
      eyebrow="Releases"
      title="Changelog"
      description="Release notes for every Glyph package, in one place."
      plans={['Every release of @glyphui/ui, tokens, blocks, auth and viewers, newest first']}
      links={[
        { label: 'Release notes on GitHub', href: 'https://github.com/khalmohak/glyph/releases' },
      ]}
    />
  )
}
