import { createContext, type ReactNode, useContext, useEffect, useId, useRef } from 'react'
import { Skeleton } from '../../components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useMotionSettings } from '../../motion/use-motion-settings'
import { EmptyState, ErrorState } from '../async/states'
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

/** A theme color name or any CSS color. */
export type ChartColorValue = ChartColor | (string & {})

export type Key<T> = Extract<keyof T, string>

/** Series without a color use the theme's chart palette, in order. */
const palette: ChartColor[] = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']

/**
 * Turns a theme color name into a CSS value. Uses the `--glyph-*` variables the theme always
 * emits: Tailwind only emits `--color-*` variables it finds in your source, and these names
 * are built at runtime.
 */
export function resolveColor(color: string | undefined, index: number): string {
  const value = color ?? palette[index % palette.length]!
  return /^[a-z][a-z\d-]*$/.test(value) ? `var(--glyph-${value})` : value
}

/**
 * The palette color for the `index`-th category. After the fifth, colors are blended toward
 * the muted surface instead of repeating, so no two categories ever share a color.
 */
export function categoryColor(color: string | undefined, index: number): string {
  if (color) return resolveColor(color, index)
  const base = resolveColor(undefined, index)
  const round = Math.floor(index / palette.length)
  if (round === 0) return base
  const mix = Math.max(30, 100 - round * 30)
  return `color-mix(in oklab, ${base} ${mix}%, var(--glyph-muted))`
}

export const defaultFormatter = (value: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : String(value)

/** A data-table cell: missing or non-numeric values (gaps in a series) read as a dash. */
export function formatCell(value: unknown, formatter: (value: number) => string): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  return Number.isFinite(n) ? formatter(n) : '—'
}

export function useChartParts() {
  const [, slots] = useComponentConfig('Chart', {})
  return { s: chartStyles(), slots }
}

/**
 * Entry and update animation for recharts series, from the theme's motion settings:
 * off for `none` and reduced motion, a little longer and bouncier for `expressive`.
 */
export function useChartAnimation() {
  const { animate, level, duration } = useMotionSettings()
  return {
    isAnimationActive: animate,
    animationDuration: Math.round(duration.slow * 1000 * (level === 'expressive' ? 2.6 : 2)),
    animationEasing: 'ease-out' as const,
  }
}

export interface LegendEntry {
  /** Stable id used for toggling. Defaults to the label. */
  key?: string
  label: ReactNode
  color: string
  hidden?: boolean
}

export interface ChartLegendProps {
  items: LegendEntry[]
  /** Makes entries buttons that show and hide their series. */
  onToggle?: ((key: string) => void) | undefined
  className?: string
}

/** Legend under a chart. Interactive when `onToggle` is set: click or press Enter to hide a series. */
export function ChartLegend({ items, onToggle, className }: ChartLegendProps) {
  const { s, slots } = useChartParts()
  if (!onToggle) {
    return (
      <ul
        data-slot="chart-legend"
        className={s.legend({ class: [slots.legend, className] })}
        aria-hidden="true"
      >
        {items.map((item, i) => (
          <li key={item.key ?? i} className={s.legendItem({ class: slots.legendItem })}>
            <span
              className={s.swatch({ class: slots.swatch })}
              style={{ background: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul
      data-slot="chart-legend"
      aria-label="Series"
      className={s.legend({ class: [slots.legend, className] })}
    >
      {items.map((item, i) => {
        const key = item.key ?? String(item.label ?? i)
        return (
          <li key={key} className={s.legendItem({ class: slots.legendItem })}>
            <button
              type="button"
              aria-pressed={!item.hidden}
              className={s.legendButton({ class: slots.legendButton })}
              onClick={() => onToggle(key)}
            >
              <span
                className={s.swatch({ class: slots.swatch })}
                style={{ background: item.color }}
              />
              {item.label}
            </button>
          </li>
        )
      })}
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

export interface ChartTooltipCardProps {
  active?: boolean | undefined
  payload?: readonly TooltipPayloadItem[] | undefined
  label?: ReactNode
  formatter: (value: number) => string
  labelFormatter?: ((label: ReactNode) => ReactNode) | undefined
  /** Adds a total row, for stacked charts. */
  total?: boolean | undefined
}

/** The themed tooltip every chart uses. Render it from recharts' `<Tooltip content>`. */
export function ChartTooltipCard({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  total,
}: ChartTooltipCardProps) {
  const { s, slots } = useChartParts()
  if (!active || !payload?.length) return null
  const sum = payload.reduce((acc, item) => acc + (Number(item.value) || 0), 0)
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
      {total && payload.length > 1 && (
        <div className={s.tooltipTotal({ class: slots.tooltipTotal })}>
          <span className={s.tooltipName({ class: slots.tooltipName })}>Total</span>
          <span className={s.tooltipValue({ class: slots.tooltipValue })}>{formatter(sum)}</span>
        </div>
      )}
    </div>
  )
}

/** Loading, error and empty handling shared by every chart. */
export interface ChartStateProps {
  /** Shows a skeleton in place of the plot. */
  loading?: boolean
  /** Shows an error message in place of the plot, with a retry button when `onRetry` is set. */
  error?: unknown
  onRetry?: () => unknown
  /** Shown when there is no data. Defaults to a short "No data" message. */
  empty?: ReactNode
}

/** Set by `ChartCard`: lets a chart render as a visible table instead of a plot. */
export interface ChartViewContextValue {
  view: 'chart' | 'table'
}

export const ChartViewContext = createContext<ChartViewContextValue | null>(null)

export interface ChartTable {
  columns: string[]
  rows: (string | number)[][]
}

export interface ChartFrameProps extends ChartStateProps {
  /** Accessible name of the chart. Shown above it unless `hideTitle` is set. */
  title: string
  description?: ReactNode
  hideTitle?: boolean | undefined
  className?: string | undefined
  legend?: LegendEntry[] | undefined
  /** Makes the legend interactive. */
  onLegendToggle?: ((key: string) => void) | undefined
  /** Columns and rows for the screen-reader table that mirrors the chart. */
  table: ChartTable
  /** Plot height, so loading, error and empty states keep the layout stable. */
  height?: number | undefined
  /** True when there is nothing to plot. */
  isEmpty?: boolean | undefined
  /**
   * The plot itself is accessible (e.g. Heatmap's keyboard grid), so it is not hidden from
   * screen readers and no duplicate table is rendered.
   */
  accessiblePlot?: boolean | undefined
  children: ReactNode
}

/**
 * Keeps everything inside a hidden plot out of the tab order. Recharts makes some parts
 * focusable (brush handles, the Sankey surface); inside an `aria-hidden` plot they would be
 * reachable but unnamed. Keyboard and screen-reader users get the data from the table.
 */
function useUnfocusable(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const plot = ref.current
    if (!enabled || !plot) return
    const apply = () => {
      for (const node of plot.querySelectorAll<HTMLElement | SVGElement>('[tabindex]')) {
        if (node.getAttribute('tabindex') !== '-1') node.setAttribute('tabindex', '-1')
      }
    }
    apply()
    const observer = new MutationObserver(apply)
    observer.observe(plot, { subtree: true, childList: true, attributeFilter: ['tabindex'] })
    return () => observer.disconnect()
  }, [enabled])
  return ref
}

function DataTable({ table }: { table: ChartTable }) {
  const { s, slots } = useChartParts()
  return (
    <div className={s.table({ class: slots.table })}>
      <Table>
        <TableHeader>
          <TableRow>
            {table.columns.map((column) => (
              <TableHead key={column} scope="col">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <TableHead key={j} scope="row" className="font-normal text-foreground">
                    {cell}
                  </TableHead>
                ) : (
                  <TableCell key={j} className="tabular-nums">
                    {cell}
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Wraps every chart in a `<figure>` with a caption and a visually hidden data table, so
 * screen-reader users get the numbers the chart shows. Also renders loading, error and empty
 * states in place of the plot, and the visible table when a `ChartCard` asks for it.
 */
export function ChartFrame({
  title,
  description,
  hideTitle,
  className,
  legend,
  onLegendToggle,
  table,
  height = 240,
  isEmpty,
  loading,
  error,
  onRetry,
  empty,
  accessiblePlot,
  children,
}: ChartFrameProps) {
  const { s, slots } = useChartParts()
  const titleId = useId()
  const viewContext = useContext(ChartViewContext)
  const plotRef = useUnfocusable(!accessiblePlot)
  const asTable = viewContext?.view === 'table'
  const captionHidden = hideTitle || viewContext !== null

  let plot: ReactNode
  let state = false
  if (loading) {
    state = true
    plot = (
      <div className={s.state({ class: slots.state })} style={{ height }} role="status">
        <Skeleton className={s.skeleton({ class: slots.skeleton })} />
        <span className={s.srOnly()}>Loading chart…</span>
      </div>
    )
  } else if (error) {
    state = true
    plot = (
      <div className={s.state({ class: slots.state })} style={{ minHeight: height }}>
        <ErrorState error={error} onRetry={onRetry} title="Couldn’t load this chart" />
      </div>
    )
  } else if (isEmpty) {
    state = true
    plot = (
      <div className={s.state({ class: slots.state })} style={{ minHeight: height }}>
        {empty ?? <EmptyState title="No data yet" description="Nothing to show for this period." />}
      </div>
    )
  } else if (asTable) {
    state = true
    plot = <DataTable table={table} />
  }

  return (
    <figure
      data-slot="chart"
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={s.root({ class: [slots.root, className] })}
    >
      <figcaption className={captionHidden ? s.srOnly() : s.caption({ class: slots.caption })}>
        <span id={titleId} className={s.title({ class: slots.title })}>
          {title}
        </span>
        {description && (
          <span className={s.description({ class: slots.description })}>{description}</span>
        )}
      </figcaption>
      {state ? (
        plot
      ) : (
        <>
          {/* Screen readers get the data table below. Charts pass `accessibilityLayer={false}`
              so recharts adds no focusable nodes inside this hidden plot. */}
          <div
            ref={plotRef}
            data-slot="chart-plot"
            className={s.plot({ class: slots.plot })}
            aria-hidden={accessiblePlot ? undefined : 'true'}
          >
            {children}
          </div>
          {legend && legend.length > 1 && <ChartLegend items={legend} onToggle={onLegendToggle} />}
          {!accessiblePlot && (
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
          )}
        </>
      )}
    </figure>
  )
}

/**
 * The hidden keys that still name a series, and never all of them. Series, slices and
 * groups can change under a legend (new data, another period); stale keys would otherwise
 * block toggles or leave the chart empty.
 */
export function currentHidden<K extends string>(hidden: readonly K[], keys: readonly K[]): K[] {
  const current = hidden.filter((key) => keys.includes(key))
  return current.length >= keys.length ? [] : current
}

/** Hidden-series state for interactive legends, controlled or not. */
export function toggleIn<K extends string>(list: readonly K[], key: K, total: number): K[] {
  if (list.includes(key)) return list.filter((k) => k !== key)
  // Never hide the last visible series: an empty plot reads as broken.
  if (list.length + 1 >= total) return [...list]
  return [...list, key]
}
