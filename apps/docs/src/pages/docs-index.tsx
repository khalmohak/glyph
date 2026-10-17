import { Card, Eyebrow, Heading, Stagger, Text } from '@glyphui/ui'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { guides } from '../lib/site'

/** /docs: every guide, in reading order. */
export function DocsIndexPage() {
  return (
    <div className="grid gap-10">
      <header className="grid max-w-2xl gap-3">
        <Eyebrow>Docs</Eyebrow>
        <Heading level={1}>Build with Glyph</Heading>
        <Text size="lead" tone="muted">
          Guides for the parts every app needs: theming, forms, tables, authentication and more.
          Start with Getting started; the rest can be read in any order.
        </Text>
      </header>
      <Stagger as="ul" className="grid gap-3 sm:grid-cols-2">
        {guides.map((guide, i) => (
          <li key={guide.slug} className="min-w-0">
            <Card variant="interactive" padding="sm" className="h-full gap-1.5" asChild>
              <Link to={`/docs/${guide.slug}`}>
                <span className="flex items-center justify-between gap-2 px-1 pt-1">
                  <span className="font-mono text-caption text-faint-foreground tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <ArrowUpRight className="size-4 text-faint-foreground" aria-hidden="true" />
                </span>
                <span className="px-1 font-display text-h4">{guide.title}</span>
                <Text size="small" tone="muted" className="px-1 pb-1">
                  {guide.description}
                </Text>
              </Link>
            </Card>
          </li>
        ))}
      </Stagger>
    </div>
  )
}
