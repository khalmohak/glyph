import examples from 'virtual:glyph-examples'
import { Button, EmptyState, Eyebrow, Heading, Separator, Text } from '@glyphui/ui'
import { ArrowLeft, Github, Hammer } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ExampleView } from '../components/example-view'
import { PropsTable } from '../components/props-table'
import { HighlightedCode, Snippet } from '../components/snippet'
import { StatusBadge } from '../components/status-badge'
import { ThemingInfo } from '../components/theming-info'
import { getDoc } from '../lib/catalog'
import { NotFoundPage } from './not-found'

const REPO = 'https://github.com/khalmohak/glyph'

export function DocPage() {
  const { slug = '' } = useParams()
  const doc = getDoc(slug)
  if (!doc) return <NotFoundPage />

  const exports = doc.exports ?? []
  const named = exports.filter((name) => /^[A-Z]/.test(name) || name.startsWith('use'))
  const shown = named.length ? named : exports.length ? exports : [doc.name]
  const importLine = `import { ${shown.slice(0, 4).join(', ')} } from '${doc.entry ?? '@glyphui/ui'}'`
  const sourceRoot = doc.entry?.startsWith('@glyphui/auth')
    ? 'packages/auth/src'
    : doc.entry?.startsWith('@glyphui/viewers')
      ? 'packages/viewers/src'
      : doc.entry === '@glyphui/blocks'
        ? 'packages/blocks/src'
        : 'packages/ui/src'

  return (
    // minmax(0, 1fr) lets wide examples and code scroll instead of widening the page on phones.
    <article className="grid grid-cols-[minmax(0,1fr)] gap-10">
      <header className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <Link
          to="/components"
          className="flex w-fit items-center gap-1.5 text-small text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Components
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow>{doc.category}</Eyebrow>
          <StatusBadge status={doc.status} />
        </div>
        <Heading level={1}>{doc.name}</Heading>
        <Text size="lead" tone="muted" className="max-w-2xl">
          {doc.description}
        </Text>
        {doc.status !== 'planned' && (
          <div className="flex flex-wrap items-center gap-2">
            <Snippet code={importLine} className="max-w-full flex-1 sm:flex-none" />
            {doc.source && (
              <Button variant="outline" size="sm" leftIcon={<Github />} asChild>
                <a href={`${REPO}/blob/main/${sourceRoot}/${doc.source}`}>Source</a>
              </Button>
            )}
            {doc.radix && (
              <Button variant="ghost" size="sm" asChild>
                <a href={doc.radix}>Radix primitive</a>
              </Button>
            )}
          </div>
        )}
        {doc.entry === '@glyphui/auth/ui' && (
          <div className="grid gap-2">
            <Text size="small" tone="muted">
              The auth screens need their stylesheet, after the Glyph and blocks ones:
            </Text>
            <Snippet code={'@import "@glyphui/auth/styles.css";'} className="max-w-full sm:w-fit" />
          </div>
        )}
        {doc.entry === '@glyphui/blocks' && doc.status !== 'planned' && (
          <div className="grid gap-2">
            <Text size="small" tone="muted">
              Blocks need their stylesheet, after the Glyph one in your main CSS file:
            </Text>
            <Snippet
              code={'@import "@glyphui/blocks/styles.css";'}
              className="max-w-full sm:w-fit"
            />
          </div>
        )}
        {doc.entry?.startsWith('@glyphui/viewers') && doc.status !== 'planned' && (
          <div className="grid gap-2">
            <Text size="small" tone="muted">
              Viewers need their stylesheet, after the Glyph one in your main CSS file:
            </Text>
            <Snippet
              code={'@import "@glyphui/viewers/styles.css";'}
              className="max-w-full sm:w-fit"
            />
          </div>
        )}
      </header>

      {doc.status === 'planned' ? (
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
      ) : (
        <>
          {(doc.examples ?? []).length > 0 && (
            <section className="grid gap-8" aria-label="Examples">
              {doc.examples!.map((example) => (
                <ExampleView key={example.file} slug={doc.slug} example={example} />
              ))}
            </section>
          )}

          {(doc.snippets ?? []).length > 0 && (
            <section className="grid gap-6" aria-label="Setup">
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
            <section className="grid gap-3">
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

          {doc.propsOf && (
            <section className="grid gap-3">
              <Separator />
              <Heading level={2} size="h3">
                API
              </Heading>
              <PropsTable component={doc.propsOf.replace(/Props$/, '')} radix={doc.radix} />
            </section>
          )}

          <section className="grid gap-3">
            <Heading level={2} size="h3">
              Theming
            </Heading>
            <ThemingInfo component={doc.propsOf?.replace(/Props$/, '') ?? doc.name} />
          </section>
        </>
      )}
    </article>
  )
}
