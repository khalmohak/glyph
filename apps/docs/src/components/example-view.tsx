import examples from 'virtual:glyph-examples'
import { Card, Spinner, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@glyphui/ui'
import { type ComponentType, type LazyExoticComponent, lazy, Suspense } from 'react'
import { exampleLoader } from '../lib/catalog'
import type { ExampleMeta } from '../lib/doc'
import { HighlightedCode } from './snippet'

// One lazy component per example, kept for the session. Creating it during render (even in
// useMemo) breaks client navigation: the new page renders in a transition, suspends, and is
// discarded, so each retry made a fresh lazy component that suspended again, forever.
const previews = new Map<string, LazyExoticComponent<ComponentType>>()

function previewFor(slug: string, file: string) {
  const key = `${slug}/${file}`
  let preview = previews.get(key)
  if (!preview) {
    preview = lazy(exampleLoader(slug, file) as () => Promise<{ default: ComponentType }>)
    previews.set(key, preview)
  }
  return preview
}

/** One example: live preview and its exact source. */
export function ExampleView({ slug, example }: { slug: string; example: ExampleMeta }) {
  const Preview = previewFor(slug, example.file)
  const source = examples[`${slug}/${example.file}`]
  const id = `example-${example.file}`

  return (
    <section aria-labelledby={id} className="grid gap-3">
      <div className="grid gap-1">
        <h3 id={id} className="font-display text-h4">
          {example.title}
        </h3>
        {example.description && (
          <Text size="small" tone="muted">
            {example.description}
          </Text>
        )}
      </div>
      <Card variant="outline" padding="none" className="overflow-hidden">
        <Tabs defaultValue="preview" className="gap-0">
          <div className="flex items-center border-b-(length:--glyph-border-width) border-border px-4">
            <TabsList className="border-0">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="preview" className="min-w-0">
            <div
              data-example={`${slug}/${example.file}`}
              className="flex min-h-36 items-center justify-center overflow-x-auto bg-background p-6 sm:p-10 [&>*]:w-full [&>*]:max-w-full [&>*]:min-w-0"
            >
              <Suspense fallback={<Spinner />}>
                <div className="flex min-w-0 justify-center [&>*]:min-w-0">
                  <Preview />
                </div>
              </Suspense>
            </div>
          </TabsContent>
          <TabsContent value="code" className="bg-subtle">
            {source ? (
              <HighlightedCode html={source.html} code={source.code} />
            ) : (
              <p className="p-4 text-small text-muted-foreground">Source unavailable.</p>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </section>
  )
}
