import examples from 'virtual:glyph-examples'
import { Card, Spinner, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@glyphui/ui'
import { type ComponentType, lazy, Suspense, useMemo } from 'react'
import { exampleLoader } from '../lib/catalog'
import type { ExampleMeta } from '../lib/doc'
import { HighlightedCode } from './snippet'

/** One example: live preview and its exact source. */
export function ExampleView({ slug, example }: { slug: string; example: ExampleMeta }) {
  const Preview = useMemo(
    () => lazy(exampleLoader(slug, example.file) as () => Promise<{ default: ComponentType }>),
    [slug, example.file],
  )
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
              className="flex min-h-36 items-center justify-center overflow-x-auto bg-background p-6 sm:p-10 [&>*]:w-full [&>*]:max-w-full"
            >
              <Suspense fallback={<Spinner />}>
                <div className="flex min-w-0 justify-center">
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
