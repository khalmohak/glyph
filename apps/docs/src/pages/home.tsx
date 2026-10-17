import { Badge, Button, Card, Eyebrow, Heading, Text } from '@glyphui/ui'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Snippet } from '../components/snippet'
import { countByStatus, docsByCategory } from '../lib/catalog'
import { version } from '../lib/version'

export function HomePage() {
  const counts = countByStatus()
  return (
    <div className="grid gap-14">
      <section className="grid gap-6">
        <Badge tone="primary" dot className="w-fit">
          v{version} · New components every release
        </Badge>
        <Heading level={1} size="display">
          One theme file. Every screen follows.
        </Heading>
        <Text size="lead" tone="muted" className="max-w-2xl">
          Glyph is a React component library on Tailwind CSS v4. Color, type, shape, depth and
          motion come from one typed theme, and forms, data tables, layouts and loading states come
          solved. These docs are built with Glyph; switch the theme in the header to restyle
          everything here.
        </Text>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" rightIcon={<ArrowRight />} asChild>
            <Link to="/getting-started">Get started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/components">Browse components</Link>
          </Button>
          <Button size="lg" variant="ghost" leftIcon={<Sparkles />} asChild>
            <a href="https://khalmohak.github.io/glyph/showcase/">Showcase</a>
          </Button>
        </div>
        <Snippet code="npm install @glyphui/ui" className="max-w-md" />
      </section>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Heading level={2} size="h3">
            Components by category
          </Heading>
          <Text size="small" tone="muted">
            {counts.stable} stable · {counts.beta} beta · {counts.planned} planned
          </Text>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docsByCategory().map(({ category, items }) => (
            <li key={category}>
              <Card variant="interactive" padding="sm" className="h-full" asChild>
                <Link to={`/components?category=${encodeURIComponent(category)}`}>
                  <Eyebrow className="px-1 pt-1">{category}</Eyebrow>
                  <Text size="small" className="px-1 pb-1">
                    {items.map((d) => d.name).join(' · ')}
                  </Text>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
