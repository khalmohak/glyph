import examples from 'virtual:glyph-examples'
import { Button, Container, Eyebrow, Heading, SegmentedControl, Text } from '@glyphui/ui'
import { ArrowUpRight, Code2, Monitor, Smartphone, Tablet } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Link } from 'react-router'
import { BlockFrame } from '../components/blocks/block-frame'
import { HighlightedCode } from '../components/snippet'
import { StatusBadge } from '../components/status-badge'
import { getDoc } from '../lib/catalog'
import type { DocMeta } from '../lib/doc'

type Device = 'phone' | 'tablet' | 'desktop'
const deviceWidth: Record<Device, number> = { phone: 390, tablet: 768, desktop: 1280 }

const deviceLabel = (icon: ReactNode, label: string) => (
  <span className="flex items-center gap-1.5 [&>svg]:size-3.5">
    {icon} {label}
  </span>
)

/** Sections in reading order: a marketing page top to bottom, then the auth screens. */
const groups: { title: string; description: string; slugs: string[] }[] = [
  {
    title: 'Marketing pages',
    description: 'Sections for a landing page, from hero to footer. From @glyphui/blocks.',
    slugs: [
      'hero',
      'logo-cloud',
      'feature-grid',
      'feature-split',
      'stats',
      'pricing',
      'testimonials',
      'faq',
      'cta',
      'newsletter',
      'section-header',
      'site-footer',
    ],
  },
  {
    title: 'Authentication',
    description: 'Sign-in, sign-up and account screens, connected to @glyphui/auth.',
    slugs: [
      'auth-layout',
      'sign-in-form',
      'sign-up-form',
      'verify-email-form',
      'password-reset',
      'social-buttons',
      'auth-card',
    ],
  },
]

/** Every block, previewed in a frame you can switch between phone, tablet and desktop. */
export function BlocksPage() {
  // Start at the visitor's own size class: phones see phone frames first.
  const [device, setDevice] = useState<Device>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
      ? 'phone'
      : 'desktop',
  )
  return (
    <Container size="full" className="grid max-w-[1440px] gap-12 py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="grid max-w-2xl gap-3">
          <Eyebrow>Blocks</Eyebrow>
          <Heading level={1}>Page sections, ready to drop in</Heading>
          <Text size="lead" tone="muted">
            Typed sections for marketing pages and sign-in flows. Each preview runs in its own
            frame, so you see the real layout at every screen size, in the site's theme.
          </Text>
        </div>
        <SegmentedControl<Device>
          aria-label="Preview width"
          value={device}
          onValueChange={setDevice}
          options={[
            { value: 'phone', label: deviceLabel(<Smartphone aria-hidden="true" />, 'Phone') },
            { value: 'tablet', label: deviceLabel(<Tablet aria-hidden="true" />, 'Tablet') },
            { value: 'desktop', label: deviceLabel(<Monitor aria-hidden="true" />, 'Desktop') },
          ]}
        />
      </header>

      {groups.map((group) => (
        <section key={group.title} className="grid gap-8" aria-labelledby={`group-${group.title}`}>
          <div className="grid gap-1 border-b border-border pb-4">
            <Heading level={2} size="h3" id={`group-${group.title}`}>
              {group.title}
            </Heading>
            <Text tone="muted">{group.description}</Text>
          </div>
          {group.slugs.map((slug) => {
            const doc = getDoc(slug)
            return doc?.examples?.length ? (
              <BlockSection key={slug} doc={doc} width={deviceWidth[device]} />
            ) : null
          })}
        </section>
      ))}
    </Container>
  )
}

function BlockSection({ doc, width: deviceWidth }: { doc: DocMeta; width: number }) {
  const examplesOf = doc.examples ?? []
  const [file, setFile] = useState(examplesOf[0]!.file)
  const [width, setWidth] = useState<number | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [lastDevice, setLastDevice] = useState(deviceWidth)
  // The page's device switch resets any width dragged by hand.
  if (lastDevice !== deviceWidth) {
    setLastDevice(deviceWidth)
    setWidth(null)
  }
  const source = examples[`${doc.slug}/${file}`]
  const id = `block-${doc.slug}`

  return (
    <article aria-labelledby={id} className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Heading level={3} size="h4" id={id}>
              {doc.name}
            </Heading>
            {doc.status !== 'stable' && <StatusBadge status={doc.status} />}
          </div>
          <Text size="small" tone="muted" className="max-w-2xl">
            {doc.description}
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {examplesOf.length > 1 && (
            <SegmentedControl
              aria-label={`${doc.name} variant`}
              size="sm"
              value={file}
              onValueChange={setFile}
              options={examplesOf.map((e) => ({ value: e.file, label: e.title }))}
            />
          )}
          <Button
            variant={showCode ? 'secondary' : 'outline'}
            size="sm"
            leftIcon={<Code2 />}
            aria-pressed={showCode}
            onClick={() => setShowCode((v) => !v)}
          >
            Code
          </Button>
          <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight />} asChild>
            <Link to={`/components/${doc.slug}`}>Docs</Link>
          </Button>
        </div>
      </div>
      <BlockFrame
        key={file}
        slug={doc.slug}
        file={file}
        title={`${doc.name} preview`}
        width={width ?? deviceWidth}
        onWidthChange={setWidth}
      />
      {showCode && source && (
        <div className="overflow-hidden rounded-lg border border-border bg-subtle">
          <HighlightedCode html={source.html} code={source.code} />
        </div>
      )}
    </article>
  )
}
