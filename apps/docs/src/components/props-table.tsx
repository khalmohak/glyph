import allProps from 'virtual:glyph-props'
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@glyphui/ui'
import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router'
import { docs } from '../lib/catalog'
import { findStyles } from './theming-info'

/** Component export name → docs slug, so types that mention a component can link to it. */
const pageOf = new Map<string, string>()
for (const doc of docs)
  for (const name of doc.exports ?? []) if (/^[A-Z]/.test(name)) pageOf.set(name, doc.slug)

/** Renders a type string with documented component names (or their `…Props`) as links. */
function TypeText({ type, self }: { type: string; self: string }): ReactNode {
  const parts = type.split(/\b([A-Z][A-Za-z0-9]*)\b/)
  return parts.map((part, i) => {
    const target = pageOf.get(part.replace(/Props$/, ''))
    const key = `${i}-${part}`
    if (i % 2 === 1 && target && target !== self)
      return (
        <Link
          key={key}
          to={`/components/${target}`}
          className="text-primary-text underline decoration-primary-text/40 underline-offset-2 hover:decoration-primary-text"
        >
          {part}
        </Link>
      )
    return <Fragment key={key}>{part}</Fragment>
  })
}

/** JSDoc text with `code spans` rendered as code. */
function Description({ text }: { text: string }) {
  return (
    <p className="mt-1 text-small text-muted-foreground">
      {text.split(/`([^`]+)`/).map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={`${i}-${part}`}
            className="rounded-xs bg-muted px-1 py-0.5 font-mono text-caption text-foreground"
          >
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </p>
  )
}

/** Props declared by Glyph itself, extracted from the TypeScript source at build time. */
export function PropsTable({
  component,
  radix,
  query = '',
  slug = '',
}: {
  component: string
  radix?: string | undefined
  /** Shows only props whose name, type or description contains this text. */
  query?: string
  /** The page this table is on, so a type doesn't link to itself. */
  slug?: string
}) {
  const all = allProps[component] ?? []
  const needle = query.trim().toLowerCase()
  const props = needle
    ? all.filter((p) =>
        [p.name, p.type, p.description ?? ''].some((s) => s.toLowerCase().includes(needle)),
      )
    : all
  // Variant defaults live in the component's tv() styles, not in its props.
  const variantDefaults = findStyles(component)?.defaultVariants ?? {}
  const inherits = radix ? (
    <>
      It also accepts every prop of the{' '}
      <a
        href={radix}
        className="text-primary-text underline decoration-primary-text/40 underline-offset-4 hover:decoration-primary-text"
      >
        Radix primitive
      </a>{' '}
      it wraps, plus <code className="font-mono">className</code>.
    </>
  ) : (
    <>
      It also accepts the props of the HTML element it renders, plus{' '}
      <code className="font-mono">className</code>.
    </>
  )

  if (needle && props.length === 0) return null

  return (
    <div className="grid gap-3">
      {!needle && (
        <Text size="small" tone="muted">
          {all.length > 0 ? `${component} props.` : `${component} adds no props of its own.`}{' '}
          {inherits}
        </Text>
      )}
      {props.length > 0 && (
        <div className="overflow-x-auto rounded-lg border-(length:--glyph-border-width) border-border">
          <Table aria-label={`${component} props`}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-32">Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.map((prop) => {
                const fallback =
                  prop.defaultValue ??
                  (prop.name in variantDefaults ? `'${String(variantDefaults[prop.name])}'` : null)
                return (
                  <TableRow key={prop.name} className="align-top">
                    <TableCell className="align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <code className="font-mono text-caption text-foreground">{prop.name}</code>
                        {prop.required && (
                          <Badge tone="danger" variant="outline" className="text-[0.6875rem]">
                            required
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56 align-top">
                      <code className="font-mono text-caption break-words text-muted-foreground">
                        <TypeText type={prop.type} self={slug} />
                      </code>
                      {prop.description && <Description text={prop.description} />}
                    </TableCell>
                    <TableCell className="align-top">
                      <code className="font-mono text-caption text-muted-foreground">
                        {fallback ?? '—'}
                      </code>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

/** Exports on a page that have a props table: the documented component first. */
export function documentedComponents(
  exportsList: readonly string[],
  primary?: string,
): readonly string[] {
  const names = exportsList.filter((name) => /^[A-Z]/.test(name) && allProps[name])
  if (primary && allProps[primary] && !names.includes(primary)) names.unshift(primary)
  return primary ? [primary, ...names.filter((n) => n !== primary)] : names
}
