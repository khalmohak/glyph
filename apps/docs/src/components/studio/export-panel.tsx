import { Button, Card, Skeleton, Text } from '@glyphui/ui'
import { Download } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { track } from '../../lib/analytics'

// Shiki loads only when someone opens the studio.
const CodeViewer = lazy(() =>
  import('@glyphui/viewers/code').then((m) => ({ default: m.CodeViewer })),
)

/** The generated `glyph.theme.ts`, ready to copy or download. */
export function ExportPanel({ code }: { code: string }) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/typescript' }))
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: 'glyph.theme.ts',
    })
    link.click()
    URL.revokeObjectURL(url)
    track('theme_exported')
  }

  return (
    <Card className="gap-4" data-testid="theme-export">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <Text weight="medium">Your theme file</Text>
          <Text size="small" tone="muted">
            Pass it to <code className="font-mono">GlyphProvider</code> in your app.
          </Text>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download />} onClick={download}>
          Download
        </Button>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CodeViewer code={code} language="ts" fileName="glyph.theme.ts" />
      </Suspense>
    </Card>
  )
}
