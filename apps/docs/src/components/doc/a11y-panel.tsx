import {
  Heading,
  Kbd,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@glyphui/ui'
import type { DocMeta } from '../../lib/doc'

/** `Shift + Tab` → <Kbd>Shift</Kbd> + <Kbd>Tab</Kbd>; `Enter or Space` keeps the "or". */
function Keys({ keys }: { keys: string }) {
  const parts = keys.split(/(\s\+\s|\sor\s|\s\/\s)/)
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={`${i}-${part}`} className="text-caption text-muted-foreground">
            {part.trim()}
          </span>
        ) : (
          <Kbd key={`${i}-${part}`}>{part}</Kbd>
        ),
      )}
    </span>
  )
}

/** The Accessibility tab: keyboard table, ARIA notes, and what it builds on. */
export function A11yPanel({ doc }: { doc: DocMeta }) {
  const keyboard = doc.a11y?.keyboard ?? []
  const notes = doc.a11y?.notes ?? []
  const primitive = doc.radix?.match(/components\/([a-z-]+)/)?.[1]?.replace(/-/g, ' ')

  return (
    <div className="grid gap-10">
      <section id="a11y-keyboard" className="grid gap-3" tabIndex={-1}>
        <Heading level={2} size="h3">
          Keyboard
        </Heading>
        {keyboard.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border-(length:--glyph-border-width) border-border">
            <Table aria-label={`${doc.name} keyboard interactions`}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-56">Keys</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keyboard.map((row) => (
                  <TableRow key={row.keys}>
                    <TableCell className="align-top">
                      <Keys keys={row.keys} />
                    </TableCell>
                    <TableCell className="text-small text-muted-foreground">{row.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <Text tone="muted">
            {doc.radix
              ? `Keyboard behavior comes from the Radix ${primitive ?? ''} primitive and follows the WAI-ARIA pattern for it.`
              : 'Uses native, focusable HTML elements, so the browser provides keyboard access: Tab to move focus, Enter or Space to activate.'}
          </Text>
        )}
      </section>

      <section id="a11y-notes" className="grid gap-3" tabIndex={-1}>
        <Heading level={2} size="h3">
          Screen readers and ARIA
        </Heading>
        <ul className="grid list-disc gap-2 pl-5 text-body text-muted-foreground marker:text-faint-foreground">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
          {doc.radix && (
            <li>
              Built on the{' '}
              <a
                href={doc.radix}
                className="text-primary-text underline decoration-primary-text/40 underline-offset-4 hover:decoration-primary-text"
              >
                Radix {primitive ?? 'primitive'}
              </a>
              , which manages roles, states and focus.
            </li>
          )}
          <li>
            Every Glyph build is checked with axe in light and dark mode, and focus rings come from
            the theme&apos;s <code className="font-mono text-caption">ring</code> color.
          </li>
        </ul>
      </section>
    </div>
  )
}
