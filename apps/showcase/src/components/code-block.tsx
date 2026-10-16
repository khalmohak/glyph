import { cn } from '@glyphui/ui'

/** Minimal code display. Highlights strings and comments only; enough for short samples. */
export function CodeBlock({
  code,
  title,
  className,
}: {
  code: string
  title?: string
  className?: string
}) {
  const lines = code.trim().split('\n')
  return (
    <figure
      className={cn(
        'min-w-0 overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-subtle',
        className,
      )}
    >
      {title && (
        <figcaption className="flex items-center gap-2 border-b border-border px-4 py-2.5 font-mono text-caption text-faint-foreground">
          {title}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed text-muted-foreground">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="block">
              {highlight(line)}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}

function highlight(line: string) {
  const comment = line.indexOf('//')
  const code = comment >= 0 ? line.slice(0, comment) : line
  const parts = code.split(/('[^']*')/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("'") ? (
          <span key={i} className="text-primary">
            {part}
          </span>
        ) : (
          <span key={i} className="text-foreground/85">
            {part}
          </span>
        ),
      )}
      {comment >= 0 && <span className="text-faint-foreground">{line.slice(comment)}</span>}
      {line === '' && ' '}
    </>
  )
}
