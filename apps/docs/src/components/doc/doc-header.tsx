import sizes from 'virtual:glyph-sizes'
import { Badge, Button, Eyebrow, Heading, Text, Tooltip } from '@glyphui/ui'
import { ArrowLeft, Github, Package } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'
import { addedIn, isNew } from '../../lib/added'
import type { DocMeta } from '../../lib/doc'
import { Snippet } from '../snippet'
import { StatusBadge } from '../status-badge'

export const REPO = 'https://github.com/khalmohak/glyph'

/** `SpreadsheetViewer` → `Spreadsheet<wbr>Viewer`, so it wraps between words when it must. */
function wordBreaks(name: string) {
  return name.split(/(?=[A-Z][a-z])/).map((part, i) => (
    <Fragment key={`${i}-${part}`}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ))
}

/** `@glyphui/ui/chart` → `@glyphui/ui`. */
const packageOf = (entry: string) => entry.split('/').slice(0, 2).join('/')

const sourceRoot = (entry: string) => `packages/${packageOf(entry).replace('@glyphui/', '')}/src`

export function formatBytes(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`
}

/** Title block of a component page: what it is, where it comes from, what it costs. */
export function DocHeader({ doc }: { doc: DocMeta }) {
  const entry = doc.entry ?? '@glyphui/ui'
  const exports = doc.exports ?? []
  const named = exports.filter((name) => /^[A-Z]/.test(name) || name.startsWith('use'))
  const shown = named.length ? named : exports.length ? exports : [doc.name]
  const importLine = `import { ${shown.slice(0, 4).join(', ')} } from '${entry}'`
  const bytes = sizes[doc.slug]
  const planned = doc.status === 'planned'

  return (
    <header className="grid grid-cols-[minmax(0,1fr)] gap-4">
      <Link
        to="/components"
        className="flex w-fit items-center gap-1.5 text-small text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Components
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <Eyebrow>{doc.category}</Eyebrow>
        <StatusBadge status={doc.status} />
        {isNew(doc.slug) && (
          <Badge tone="primary" dot>
            New in {addedIn[doc.slug]?.split('.').slice(0, 2).join('.')}
          </Badge>
        )}
      </div>
      {/* Long names (SpreadsheetViewer) in wide display fonts must wrap on phones. */}
      <Heading level={1} className="[overflow-wrap:anywhere]">
        {wordBreaks(doc.name)}
      </Heading>
      <Text size="lead" tone="muted" className="max-w-2xl">
        {doc.description}
      </Text>
      {!planned && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Snippet code={importLine} className="max-w-full flex-1 sm:flex-none" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {packageOf(entry)}
            </Badge>
            {bytes !== undefined && (
              <Tooltip content="Imported on its own: minified and gzipped, with React and peer dependencies left out.">
                <Badge variant="outline" className="font-mono" data-testid="gzip-size" tabIndex={0}>
                  {formatBytes(bytes)} gzip
                </Badge>
              </Tooltip>
            )}
            {doc.source && (
              <Button variant="ghost" size="sm" leftIcon={<Github />} asChild>
                <a href={`${REPO}/blob/main/${sourceRoot(entry)}/${doc.source}`}>Source</a>
              </Button>
            )}
            <Button variant="ghost" size="sm" leftIcon={<Package />} asChild>
              <a href={`https://www.npmjs.com/package/${packageOf(entry)}`}>npm</a>
            </Button>
            {doc.radix && (
              <Button variant="ghost" size="sm" asChild>
                <a href={doc.radix}>Radix primitive</a>
              </Button>
            )}
          </div>
          {stylesheetNote(entry)}
        </>
      )}
    </header>
  )
}

function stylesheetNote(entry: string) {
  const sheet = entry.startsWith('@glyphui/auth/ui')
    ? '@glyphui/auth/styles.css'
    : entry === '@glyphui/blocks'
      ? '@glyphui/blocks/styles.css'
      : entry.startsWith('@glyphui/viewers')
        ? '@glyphui/viewers/styles.css'
        : null
  if (!sheet) return null
  return (
    <div className="grid gap-2">
      <Text size="small" tone="muted">
        Needs its stylesheet, after the Glyph one in your main CSS file:
      </Text>
      <Snippet code={`@import "${sheet}";`} className="max-w-full sm:w-fit" />
    </div>
  )
}
