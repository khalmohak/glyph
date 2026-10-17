import examples from 'virtual:glyph-examples'
import {
  Button,
  EmptyState,
  Heading,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@glyphui/ui'
import { ArrowLeft, ArrowRight, Hammer, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { A11yPanel } from '../components/doc/a11y-panel'
import { DocHeader, REPO } from '../components/doc/doc-header'
import { Toc, type TocItem } from '../components/doc/toc'
import { ExampleView } from '../components/example-view'
import { documentedComponents, PropsTable } from '../components/props-table'
import { HighlightedCode } from '../components/snippet'
import { ThemingInfo } from '../components/theming-info'
import { docs, docsByCategory, getDoc } from '../lib/catalog'
import type { DocMeta } from '../lib/doc'
import { playgroundFor } from '../playground/model'
import { Playground } from '../playground/playground'
import { NotFoundPage } from './not-found'

const TABS = ['examples', 'playground', 'api', 'theming', 'accessibility'] as const
type Tab = (typeof TABS)[number]

const TAB_LABELS: Record<Tab, string> = {
  examples: 'Examples',
  playground: 'Playground',
  api: 'API',
  theming: 'Theming',
  accessibility: 'Accessibility',
}

/** Sidebar order, for previous / next links. */
const ordered = docsByCategory(docs).flatMap((group) => group.items)

function Neighbors({ doc }: { doc: DocMeta }) {
  const index = ordered.findIndex((d) => d.slug === doc.slug)
  const prev = index > 0 ? ordered[index - 1] : undefined
  const next = index >= 0 ? ordered[index + 1] : undefined
  if (!prev && !next) return null
  const card =
    'group grid gap-1 rounded-lg border-(length:--glyph-border-width) border-border bg-surface p-4 transition-colors hover:border-ring/50'
  return (
    <nav aria-label="Previous and next components" className="grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link to={`/components/${prev.slug}`} className={card}>
          <span className="flex items-center gap-1 text-caption text-muted-foreground">
            <ArrowLeft className="size-3.5" aria-hidden="true" /> Previous
          </span>
          <span className="font-medium">{prev.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={`/components/${next.slug}`} className={`${card} sm:text-right`}>
          <span className="flex items-center gap-1 text-caption text-muted-foreground sm:justify-end">
            Next <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
          <span className="font-medium">{next.name}</span>
        </Link>
      )}
    </nav>
  )
}

function ExamplesPanel({ doc }: { doc: DocMeta }) {
  return (
    <div className="grid gap-12">
      {(doc.examples ?? []).length > 0 && (
        <section className="grid gap-10" aria-label="Examples">
          {doc.examples!.map((example) => (
            <ExampleView key={example.file} slug={doc.slug} example={example} />
          ))}
        </section>
      )}

      {(doc.snippets ?? []).length > 0 && (
        <section id="setup" className="grid gap-6" aria-label="Setup" tabIndex={-1}>
          {doc.snippets!.map((snippet) => {
            const source = examples[`${doc.slug}/snippets/${snippet.file}`]
            return (
              <div key={snippet.file} className="grid gap-3">
                <div className="grid gap-1">
                  <Heading level={2} size="h4">
                    {snippet.title}
                  </Heading>
                  {snippet.description && <Text tone="muted">{snippet.description}</Text>}
                </div>
                {source && (
                  <HighlightedCode
                    html={source.html}
                    code={source.code}
                    className="rounded-lg border-(length:--glyph-border-width) border-border bg-subtle"
                  />
                )}
              </div>
            )
          })}
        </section>
      )}

      {doc.notes && doc.notes.length > 0 && (
        <section id="usage-notes" className="grid gap-3" tabIndex={-1}>
          <Heading level={2} size="h3">
            Usage notes
          </Heading>
          <ul className="grid list-disc gap-2 pl-5 text-body text-muted-foreground marker:text-faint-foreground">
            {doc.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function ApiPanel({ doc, components }: { doc: DocMeta; components: readonly string[] }) {
  const [query, setQuery] = useState('')
  return (
    <div className="grid gap-8">
      {components.length > 0 ? (
        <>
          <Input
            type="search"
            size="sm"
            aria-label="Filter props"
            placeholder="Filter props by name, type or description…"
            prefix={<Search />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="max-w-sm"
          />
          {components.map((name, i) => (
            <section key={name} id={`api-${name}`} className="grid gap-3" tabIndex={-1}>
              <Heading level={2} size={i === 0 ? 'h3' : 'h4'}>
                <code className="font-mono">{name}</code>
              </Heading>
              <PropsTable
                component={name}
                radix={i === 0 ? doc.radix : undefined}
                query={query}
                slug={doc.slug}
              />
            </section>
          ))}
        </>
      ) : (
        <Text tone="muted">
          This page documents hooks or utilities rather than a component; the examples show their
          signatures in use.
        </Text>
      )}
    </div>
  )
}

export function DocPage() {
  const { slug = '' } = useParams()
  const doc = getDoc(slug)
  const [params, setParams] = useSearchParams()
  const playground = useMemo(() => (doc ? playgroundFor(doc) : null), [doc])
  const primary = doc?.propsOf?.replace(/Props$/, '')
  const components = useMemo(
    () => (doc ? documentedComponents(doc.exports ?? [], primary) : []),
    [doc, primary],
  )

  if (!doc) return <NotFoundPage />

  if (doc.status === 'planned') {
    return (
      <article className="grid grid-cols-[minmax(0,1fr)] gap-10">
        <DocHeader doc={doc} />
        <EmptyState
          icon={<Hammer />}
          title="On the roadmap"
          description="This component isn't built yet. Upvote or discuss it on GitHub to move it up."
          action={
            <Button variant="outline" size="sm" asChild>
              <a href={`${REPO}/discussions`}>Discuss on GitHub</a>
            </Button>
          }
        />
      </article>
    )
  }

  const tabs = TABS.filter((tab) => tab !== 'playground' || playground)
  const requested = params.get('tab') as Tab | null
  const tab: Tab = requested && tabs.includes(requested) ? requested : 'examples'
  const setTab = (next: string) =>
    setParams(
      (current) => {
        const out = new URLSearchParams(current)
        if (next === 'examples') out.delete('tab')
        else out.set('tab', next)
        return out
      },
      { replace: true, preventScrollReset: true },
    )

  const toc: TocItem[] =
    tab === 'examples'
      ? [
          ...(doc.examples ?? []).map((e) => ({ id: `example-${e.file}`, label: e.title })),
          ...((doc.snippets ?? []).length ? [{ id: 'setup', label: 'Setup' }] : []),
          ...(doc.notes?.length ? [{ id: 'usage-notes', label: 'Usage notes' }] : []),
        ]
      : tab === 'api'
        ? components.map((name) => ({ id: `api-${name}`, label: name }))
        : tab === 'accessibility'
          ? [
              { id: 'a11y-keyboard', label: 'Keyboard' },
              { id: 'a11y-notes', label: 'Screen readers and ARIA' },
            ]
          : []

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-12">
      <article className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-10">
        <DocHeader doc={doc} />
        <Tabs value={tab} onValueChange={setTab} className="grid min-w-0 gap-8">
          <TabsList className="max-w-full overflow-x-auto">
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>
                {TAB_LABELS[t]}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="examples">
            <ExamplesPanel doc={doc} />
          </TabsContent>
          {playground && (
            <TabsContent value="playground">
              <Playground playground={playground} />
            </TabsContent>
          )}
          <TabsContent value="api">
            <ApiPanel doc={doc} components={components} />
          </TabsContent>
          <TabsContent value="theming">
            <section id="theming" className="grid gap-4" tabIndex={-1}>
              <Heading level={2} size="h3">
                Theme recipe
              </Heading>
              <ThemingInfo component={primary ?? doc.name} />
            </section>
          </TabsContent>
          <TabsContent value="accessibility">
            <A11yPanel doc={doc} />
          </TabsContent>
        </Tabs>
        <Neighbors doc={doc} />
      </article>
      <aside className="hidden xl:block">
        <div className="sticky top-24">
          <Toc items={toc} />
        </div>
      </aside>
    </div>
  )
}
