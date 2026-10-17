import { type KeyboardEvent, type ReactNode, useMemo, useRef, useState } from 'react'
import { cn } from '../../utils/cn'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  defaultFormatter,
  type Key,
  resolveColor,
  useChartParts,
} from './chart-parts'
import { useElementWidth } from './use-element-width'

type Row = Record<string, unknown>

export interface HeatmapProps<T extends object> extends ChartStateProps {
  /** One row per day. Missing days count as zero. */
  data: readonly T[]
  /** Field holding the day: a Date, a timestamp or a `YYYY-MM-DD` string. */
  date: Key<T>
  /** Field holding the day's value. */
  value: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** First day shown. Defaults to 52 weeks before `to`. */
  from?: Date
  /** Last day shown. Defaults to the latest day in `data`, or today. */
  to?: Date
  /** 0 starts weeks on Sunday, 1 on Monday. Default 0. */
  weekStart?: 0 | 1
  /** Default `chart-1`. Busier days get stronger tints of it. */
  color?: ChartColorValue
  /** Number of tint steps above zero. Default 4. */
  levels?: number
  valueFormatter?: (value: number) => string
  /** Noun read after the value, e.g. `"deploys"` → "12 deploys on Mon, Oct 6". */
  unit?: string
  /** Locale for month and day names. Defaults to the browser's. */
  locale?: string
  onCellClick?: (date: Date, value: number) => void
  className?: string
}

const CELL = 12
const GAP = 3
const LEFT = 30
const TOP = 18
const DAY = 86_400_000

const valid = (d: Date) => (Number.isNaN(d.getTime()) ? undefined : d)

function toDate(input: unknown): Date | undefined {
  // An invalid date would become the range end and empty the whole grid.
  if (input instanceof Date) return valid(input)
  if (typeof input === 'number') return valid(new Date(input))
  if (typeof input === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input)
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    const parsed = new Date(input)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }
  return undefined
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

interface Cell {
  key: string
  date: Date
  value: number
  level: number
  week: number
  weekday: number
}

/**
 * Activity per day over months, like a contribution calendar. Each day is a keyboard
 * reachable cell: Tab into the grid, then use the arrow keys, Home and End.
 */
export function Heatmap<T extends object>(props: HeatmapProps<T>) {
  const {
    data,
    date,
    value,
    weekStart = 0,
    levels = 4,
    valueFormatter = defaultFormatter,
    unit,
    locale,
  } = props
  const { s, slots } = useChartParts()
  const [ref, renderedWidth] = useElementWidth<HTMLDivElement>(0)
  const gridRef = useRef<SVGSVGElement>(null)

  const { cells, weeks, months, max, byKey, first, last } = useMemo(() => {
    const values = new Map<string, number>()
    let latest: Date | undefined
    for (const row of data as readonly Row[]) {
      const day = toDate(row[date])
      if (!day) continue
      const k = dayKey(day)
      values.set(k, (values.get(k) ?? 0) + (Number(row[value]) || 0))
      if (!latest || day > latest) latest = day
    }
    const end = startOfDay(props.to ?? latest ?? new Date())
    const start = startOfDay(props.from ?? addDays(end, -7 * 52 + 1))
    const offset = (start.getDay() - weekStart + 7) % 7
    const gridStart = addDays(start, -offset)
    const top = Math.max(0, ...values.values())
    const list: Cell[] = []
    const index = new Map<string, Cell>()
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const k = dayKey(d)
      const v = values.get(k) ?? 0
      const days = Math.round((d.getTime() - gridStart.getTime()) / DAY)
      const cell: Cell = {
        key: k,
        date: d,
        value: v,
        level: v <= 0 || top === 0 ? 0 : Math.min(levels, Math.ceil((v / top) * levels)),
        week: Math.floor(days / 7),
        weekday: days % 7,
      }
      list.push(cell)
      index.set(k, cell)
    }
    const monthLabels: { week: number; label: string }[] = []
    const monthFormat = new Intl.DateTimeFormat(locale, { month: 'short' })
    let lastMonth = -1
    for (const cell of list) {
      if (cell.date.getDate() <= 7 && cell.weekday === 0 && cell.date.getMonth() !== lastMonth) {
        const previous = monthLabels[monthLabels.length - 1]
        if (!previous || cell.week - previous.week >= 3)
          monthLabels.push({ week: cell.week, label: monthFormat.format(cell.date) })
        lastMonth = cell.date.getMonth()
      }
    }
    return {
      cells: list,
      weeks: (list[list.length - 1]?.week ?? 0) + 1,
      months: monthLabels,
      max: top,
      byKey: index,
      first: list[0],
      last: list[list.length - 1],
    }
  }, [data, date, value, props.from, props.to, weekStart, levels, locale])

  const [focused, setFocused] = useState<string | undefined>()
  const [hovered, setHovered] = useState<string | undefined>()
  const activeKey = focused && byKey.has(focused) ? focused : last?.key

  const base = resolveColor(props.color ?? 'chart-1', 0)
  const tint = (level: number) => {
    if (level === 0) return 'var(--glyph-muted)'
    const share = levels === 1 ? 100 : Math.round(30 + (70 * (level - 1)) / (levels - 1))
    return share >= 100 ? base : `color-mix(in oklab, ${base} ${share}%, var(--glyph-muted))`
  }

  const width = LEFT + weeks * (CELL + GAP)
  const height = TOP + 7 * (CELL + GAP)
  const dayFormat = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: 'short' })
  const describe = (cell: Cell) =>
    `${valueFormatter(cell.value)}${unit ? ` ${unit}` : ''} on ${dayFormat.format(cell.date)}`

  const move = (event: KeyboardEvent<SVGRectElement>, cell: Cell) => {
    const steps: Record<string, number> = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
      PageUp: -28,
      PageDown: 28,
    }
    let target: Cell | undefined
    if (event.key in steps) {
      const next = byKey.get(dayKey(addDays(cell.date, steps[event.key]!)))
      target = next ?? cell
    } else if (event.key === 'Home') target = first
    else if (event.key === 'End') target = last
    else if ((event.key === 'Enter' || event.key === ' ') && props.onCellClick) {
      event.preventDefault()
      props.onCellClick(cell.date, cell.value)
      return
    } else return
    event.preventDefault()
    if (!target) return
    setFocused(target.key)
    gridRef.current?.querySelector<SVGRectElement>(`[data-day="${target.key}"]`)?.focus()
  }

  const tooltipCell = byKey.get(hovered ?? '') ?? (focused ? byKey.get(focused) : undefined)
  const scale = renderedWidth > 0 ? Math.min(renderedWidth, width) / width : 1

  const table = {
    columns: ['Date', String(value)],
    rows: cells.map((cell) => [dayFormat.format(cell.date), valueFormatter(cell.value)]),
  }

  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      table={table}
      height={height}
      isEmpty={data.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
      accessiblePlot
    >
      {/* The grid is drawn in SVG so it scales and exports; ARIA grid roles give it table
          semantics and roving focus, which a <table> of tiny cells could not lay out. */}
      {/* biome-ignore lint/a11y/useSemanticElements: see above */}
      <div
        ref={ref}
        role="grid"
        aria-label={props.title}
        aria-rowcount={7}
        className="relative w-full"
        onMouseLeave={() => setHovered(undefined)}
      >
        <svg
          ref={gridRef}
          role="presentation"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ maxWidth: width }}
          className="block h-auto overflow-visible"
        >
          {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: plain text labels, nothing focusable */}
          <g aria-hidden="true" fontSize={10} fill="var(--glyph-muted-foreground)">
            {months.map((month) => (
              <text
                key={`${month.week}-${month.label}`}
                x={LEFT + month.week * (CELL + GAP)}
                y={10}
              >
                {month.label}
              </text>
            ))}
            {/* Label Monday, Wednesday and Friday, whichever rows they fall on. */}
            {[1, 3, 5].map((day) => {
              const row = (day - weekStart + 7) % 7
              return (
                <text key={day} x={0} y={TOP + row * (CELL + GAP) + CELL - 2}>
                  {weekdayFormat.format(addDays(new Date(2023, 0, 1), day))}
                </text>
              )
            })}
          </g>
          {Array.from({ length: 7 }, (_, weekday) => (
            // biome-ignore lint/a11y/useSemanticElements: SVG has no table rows
            <g key={weekday} role="row" aria-rowindex={weekday + 1}>
              {cells
                .filter((cell) => cell.weekday === weekday)
                .map((cell) => (
                  // biome-ignore lint/a11y/useSemanticElements: SVG has no table cells
                  <rect
                    key={cell.key}
                    role="gridcell"
                    data-day={cell.key}
                    data-level={cell.level}
                    aria-label={describe(cell)}
                    aria-colindex={cell.week + 1}
                    tabIndex={cell.key === activeKey ? 0 : -1}
                    x={LEFT + cell.week * (CELL + GAP)}
                    y={TOP + weekday * (CELL + GAP)}
                    width={CELL}
                    height={CELL}
                    rx={2.5}
                    fill={tint(cell.level)}
                    className={cn(
                      'outline-none focus-visible:stroke-ring focus-visible:[stroke-width:2]',
                      props.onCellClick && 'cursor-pointer',
                    )}
                    onMouseEnter={() => setHovered(cell.key)}
                    onFocus={() => setFocused(cell.key)}
                    onBlur={() =>
                      setFocused((current) => (current === cell.key ? undefined : current))
                    }
                    onKeyDown={(event) => move(event, cell)}
                    onClick={() => props.onCellClick?.(cell.date, cell.value)}
                  />
                ))}
            </g>
          ))}
        </svg>
        {tooltipCell && (
          <div
            aria-hidden="true"
            data-slot="chart-tooltip"
            className={s.tooltip({
              class: [
                slots.tooltip,
                'pointer-events-none absolute z-10 min-w-0 -translate-x-1/2 -translate-y-full whitespace-nowrap',
              ],
            })}
            style={{
              left: (LEFT + tooltipCell.week * (CELL + GAP) + CELL / 2) * scale,
              top: (TOP + tooltipCell.weekday * (CELL + GAP)) * scale - 6,
            }}
          >
            <span className={s.tooltipValue({ class: slots.tooltipValue })}>
              {valueFormatter(tooltipCell.value)}
              {unit ? ` ${unit}` : ''}
            </span>{' '}
            <span className="text-muted-foreground">{dayFormat.format(tooltipCell.date)}</span>
          </div>
        )}
      </div>
      <div
        aria-hidden="true"
        className="mt-2 flex items-center justify-end gap-1 text-caption text-muted-foreground"
        style={{ maxWidth: width }}
      >
        <span className="mr-1">Less</span>
        {Array.from({ length: levels + 1 }, (_, level) => (
          <span
            key={level}
            className="size-2.5 rounded-[2px]"
            style={{ background: tint(level) }}
            title={level === levels && max > 0 ? `${valueFormatter(max)}` : undefined}
          />
        ))}
        <span className="ml-1">More</span>
      </div>
    </ChartFrame>
  )
}
