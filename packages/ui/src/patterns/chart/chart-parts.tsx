import { type ReactNode, useId } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { chartStyles } from './chart.styles'

/** Theme colors a series can use by name. Any CSS color also works. */
export type ChartColor =
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'foreground'
  | 'muted-foreground'

/** Series without a color use the theme's chart palette, in order. */
const palette: ChartColor[] = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']

export function resolveColor(color: string | undefined, index: number): string {
  const value = color ?? palette[index % palette.length]!
  return /^[a-z][a-z\d-]*$/.test(value) ? `var(--color-${value})` : value
}

export const defaultFormatter = (value: number) =>
  typeof value === 'number' ? value.toLocaleString() : String(value)

export function useChartParts() {
  const [, slots] = useComponentConfig('Chart', {})
  return { s: chartStyles(), slots }
}

export interface LegendEntry {
  label: ReactNode
  color: string
}

export function ChartLegend({ items }: { items: LegendEntry[] }) {
  const { s, slots } = useChartParts()
  return (
    <ul data-slot="chart-legend" className={s.legend({ class: slots.legend })} aria-hidden="true">
      {items.map((item, i) => (
        <li key={i} className={s.legendItem({ class: slots.legendItem })}>
          <span className={s.swatch({ class: slots.swatch })} style={{ background: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

interface TooltipPayloadItem {
  name?: string | number
  value?: unknown
  color?: string
  dataKey?: unknown
  payload?: Record<string, unknown> & { fill?: string }
}

export function ChartTooltipCard({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: {
  active?: boolean
  payload?: readonly TooltipPayloadItem[]
  label?: ReactNode
  formatter: (value: number) => string
  labelFormatter?: ((label: ReactNode) => ReactNode) | undefined
}) {
  const { s, slots } = useChartParts()
  if (!active || !payload?.length) return null
  return (
    <div data-slot="chart-tooltip" className={s.tooltip({ class: slots.tooltip })}>
      {label !== undefined && label !== '' && (
        <p className={s.tooltipLabel({ class: slots.tooltipLabel })}>
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((item, i) => (
        <div key={i} className={s.tooltipRow({ class: slots.tooltipRow })}>
          <span
            className={s.swatch({ class: slots.swatch })}
            style={{ background: item.color ?? item.payload?.fill }}
          />
          <span className={s.tooltipName({ class: slots.tooltipName })}>
            {String(item.name ?? '')}
          </span>
          <span className={s.tooltipValue({ class: slots.tooltipValue })}>
            {formatter(Number(item.value))}
          </span>
        </div>
      ))}
    </div>
  )
}

export interface ChartFrameProps {
  /** Accessible name of the chart. Shown above it unless `hideTitle` is set. */
  title: string
  description?: ReactNode
  hideTitle?: boolean
  className?: string
  legend?: LegendEntry[] | undefined
  /** Columns and rows for the screen-reader table that mirrors the chart. */
  table: { columns: string[]; rows: (string | number)[][] }
  children: ReactNode
}

/**
 * Wraps every chart in a `<figure>` with a caption and a visually hidden data table,
 * so screen-reader users get the numbers the chart shows.
 */
export function ChartFrame({
  title,
  description,
  hideTitle,
  className,
  legend,
  table,
  children,
}: ChartFrameProps) {
  const { s, slots } = useChartParts()
  const titleId = useId()
  return (
    <figure
      data-slot="chart"
      aria-labelledby={titleId}
      className={s.root({ class: [slots.root, className] })}
    >
      <figcaption className={hideTitle ? s.srOnly() : s.caption({ class: slots.caption })}>
        <span id={titleId} className={s.title({ class: slots.title })}>
          {title}
        </span>
        {description && (
          <span className={s.description({ class: slots.description })}>{description}</span>
        )}
      </figcaption>
      {/* Screen readers get the data table below. Charts pass `accessibilityLayer={false}`
          so recharts adds no focusable nodes inside this hidden plot. */}
      <div className={s.plot({ class: slots.plot })} aria-hidden="true">
        {children}
      </div>
      {legend && legend.length > 1 && <ChartLegend items={legend} />}
      <table className={s.srOnly()}>
        <caption>{title}</caption>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
