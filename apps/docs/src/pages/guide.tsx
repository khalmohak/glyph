import { Button, Card, cn, Eyebrow, Heading, LoadingState, Text } from '@glyphui/ui'
import { ArrowLeft, ArrowRight, Pencil } from 'lucide-react'
import type { MDXComponents } from 'mdx/types'
import {
  type ComponentType,
  type LazyExoticComponent,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { CopyAsMarkdown } from '../components/copy-as-markdown'
import { mdxComponents } from '../components/mdx'
import { type GuideHeading, guideIndex as guides } from '../lib/content'
import { REPO_URL } from '../lib/site'
import { NotFoundPage } from './not-found'

type GuideContent = ComponentType<{ components?: MDXComponents }>

const modules = import.meta.glob<{ default: GuideContent }>('../guides/*.mdx')

// One lazy component per guide for the whole session: created during render, a new lazy
// component would suspend again on every retry and navigation between guides would hang.
const contents = new Map<string, LazyExoticComponent<GuideContent>>()
function contentFor(slug: string) {
  let content = contents.get(slug)
  const load = modules[`../guides/${slug}.mdx`]
  if (!content && load) {
    content = lazy(load)
    contents.set(slug, content)
  }
  return content
}

/** Highlights the heading currently at the top of the viewport. */
function useActiveHeading(headings: GuideHeading[], ready: boolean) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    if (!ready || typeof IntersectionObserver === 'undefined') return
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = headings.find((h) => visible.has(h.id))
        if (first) setActive(first.id)
      },
      { rootMargin: '-80px 0px -65% 0px' },
    )
    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [headings, ready])
  return active
}

function TableOfContents({ headings, ready }: { headings: GuideHeading[]; ready: boolean }) {
  const active = useActiveHeading(headings, ready)
  if (headings.length < 2) return null
  return (
    <nav aria-label="On this page" className="sticky top-24 grid gap-3 text-small">
      <Text
        size="caption"
        weight="medium"
        tone="muted"
        className="font-mono tracking-wide uppercase"
      >
        On this page
      </Text>
      <ul className="grid gap-1.5 border-l-(length:--glyph-border-width) border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 border-transparent py-0.5 text-muted-foreground transition-colors hover:text-foreground',
                h.depth === 3 ? 'pl-6' : 'pl-3',
                'aria-[current=location]:border-primary aria-[current=location]:text-foreground',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Scrolls to `#hash` once the guide's content has rendered (it loads after the page). */
function ScrollToHash({ onReady }: { onReady: () => void }) {
  const { hash } = useLocation()
  useEffect(() => {
    onReady()
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
  }, [hash, onReady])
  return null
}

function PrevNext({ slug }: { slug: string }) {
  const index = guides.findIndex((g) => g.slug === slug)
  const prev = guides[index - 1]
  const next = guides[index + 1]
  return (
    <nav aria-label="More guides" className="mt-16 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Card variant="interactive" padding="sm" className="gap-1" asChild>
          <Link to={`/docs/${prev.slug}`}>
            <span className="flex items-center gap-1.5 px-1 pt-1 text-caption text-muted-foreground">
              <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
            </span>
            <span className="px-1 pb-1 font-display text-h4">{prev.title}</span>
          </Link>
        </Card>
      ) : (
        <span />
      )}
      {next && (
        <Card variant="interactive" padding="sm" className="gap-1 text-right" asChild>
          <Link to={`/docs/${next.slug}`}>
            <span className="flex items-center justify-end gap-1.5 px-1 pt-1 text-caption text-muted-foreground">
              Next <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
            <span className="px-1 pb-1 font-display text-h4">{next.title}</span>
          </Link>
        </Card>
      )}
    </nav>
  )
}

function GuideArticle({ slug }: { slug: string }) {
  const guide = guides.find((g) => g.slug === slug)
  const Content = contentFor(slug)
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])
  if (!guide || !Content) return <NotFoundPage />

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <article className="min-w-0 max-w-3xl" data-guide={guide.slug}>
        <header className="grid gap-3 border-b-(length:--glyph-border-width) border-border pb-8">
          <Eyebrow>{guide.section}</Eyebrow>
          <Heading level={1}>{guide.title}</Heading>
          <Text size="lead" tone="muted" className="max-w-2xl text-pretty">
            {guide.description}
          </Text>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <CopyAsMarkdown path={`/docs/${guide.slug}`} title={guide.title} />
            <Button variant="ghost" size="sm" leftIcon={<Pencil />} asChild>
              <a
                href={`${REPO_URL}/edit/main/apps/docs/src/guides/${guide.slug}.mdx`}
                target="_blank"
                rel="noreferrer"
              >
                Edit on GitHub
              </a>
            </Button>
          </div>
        </header>
        <div className="pt-2" data-slot="guide-body">
          <Suspense fallback={<LoadingState label="Loading guide" className="py-24" />}>
            <Content components={mdxComponents} />
            <ScrollToHash onReady={markReady} />
          </Suspense>
        </div>
        <PrevNext slug={guide.slug} />
      </article>
      <aside className="hidden xl:block">
        <TableOfContents headings={guide.headings} ready={ready} />
      </aside>
    </div>
  )
}

/** /docs/:slug */
export function GuidePage() {
  const { slug = '' } = useParams()
  // Keyed so each guide mounts fresh: its own scroll-spy and content state.
  return <GuideArticle key={slug} slug={slug} />
}

/** /getting-started: the same guide at its older, shorter URL. */
export function GettingStartedGuide() {
  return <GuideArticle slug="getting-started" />
}
