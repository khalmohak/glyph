import allProps from 'virtual:glyph-props'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from '@glyphui/ui'
import { findStyles } from './theming-info'

/** Props declared by Glyph itself, extracted from the TypeScript source at build time. */
export function PropsTable({
  component,
  radix,
}: {
  component: string
  radix?: string | undefined
}) {
  const props = allProps[component] ?? []
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

  return (
    <div className="grid gap-3">
      <Text size="small" tone="muted">
        {props.length > 0 ? `${component} props.` : `${component} adds no props of its own.`}{' '}
        {inherits}
      </Text>
      {props.length > 0 && (
        <div className="overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.map((prop) => (
                <TableRow key={prop.name} className="align-top">
                  <TableCell className="whitespace-nowrap align-top">
                    <code className="font-mono text-caption text-foreground">
                      {prop.name}
                      {prop.required && <span className="text-danger">*</span>}
                    </code>
                  </TableCell>
                  <TableCell className="min-w-56 align-top">
                    <code className="font-mono text-caption break-words text-muted-foreground">
                      {prop.type}
                    </code>
                    {prop.description && (
                      <p className="mt-1 text-small text-muted-foreground">{prop.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <code className="font-mono text-caption text-muted-foreground">
                      {prop.defaultValue ??
                        (prop.name in variantDefaults
                          ? `'${String(variantDefaults[prop.name])}'`
                          : '—')}
                    </code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
