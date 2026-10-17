import * as blocks from '@glyphui/blocks'
import * as ui from '@glyphui/ui'
import { Text } from '@glyphui/ui'
import * as chart from '@glyphui/ui/chart'
import * as dataTable from '@glyphui/ui/data-table'
import * as form from '@glyphui/ui/form'
import { HighlightedCode } from './snippet'

interface StylesFn {
  slots?: Record<string, unknown>
  variants?: Record<string, Record<string, unknown>>
  defaultVariants?: Record<string, unknown>
}

const modules: Record<string, unknown>[] = [ui, form, dataTable, chart, blocks]

export function findStyles(component: string): StylesFn | undefined {
  const key = `${component[0]!.toLowerCase()}${component.slice(1)}Styles`
  for (const mod of modules) {
    const value = mod[key]
    if (typeof value === 'function') return value as StylesFn
  }
  return undefined
}

/** Shows how to restyle a component from the theme file: its slots and variants, read from its styles. */
export function ThemingInfo({ component }: { component: string }) {
  const styles = findStyles(component)
  if (!styles?.slots)
    return (
      <Text tone="muted">
        {component} has no styles of its own: it is built from other Glyph components, so it follows
        their theme recipes and your theme&apos;s tokens.
      </Text>
    )
  const slots = Object.keys(styles.slots)
  const variants = Object.entries(styles.variants ?? {})
    .map(([name, values]) => [name, Object.keys(values)] as const)
    .filter(([, values]) => values.length > 0)

  const firstVariant = variants[0]
  const code = [
    'defineTheme({',
    '  extends: presets.glyph,',
    '  components: {',
    `    ${component}: {`,
    ...(firstVariant
      ? [`      defaultVariants: { ${firstVariant[0]}: '${firstVariant[1][0]}' },`]
      : []),
    `      className: { ${slots[0]}: 'your-classes' },`,
    '    },',
    '  },',
    '})',
  ].join('\n')

  return (
    <div className="grid gap-4">
      <Text size="small" tone="muted">
        Set defaults and extra classes for every {component} in your theme file. Both are
        type-checked.
      </Text>
      <dl className="grid gap-3 text-small sm:grid-cols-[8rem_1fr]">
        <dt className="text-muted-foreground">Slots</dt>
        <dd className="flex flex-wrap gap-1.5">
          {slots.map((slot) => (
            <code key={slot} className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-caption">
              {slot}
            </code>
          ))}
        </dd>
        {variants.map(([name, values]) => (
          <div key={name} className="contents">
            <dt className="text-muted-foreground">{name}</dt>
            <dd className="flex flex-wrap gap-1.5">
              {values.map((value) => (
                <code
                  key={value}
                  className="rounded-xs bg-muted px-1.5 py-0.5 font-mono text-caption"
                >
                  {value}
                </code>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <div className="overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-subtle">
        <HighlightedCode
          code={code}
          html={`<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`}
        />
      </div>
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
