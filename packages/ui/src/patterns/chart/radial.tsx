import { type ReactNode, useEffect, useId, useState } from 'react'
import * as R from 'recharts'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useMotionSettings } from '../../motion/use-motion-settings'
import { type ChartSeries, chartTooltip, useCartesian } from './cartesian'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  categoryColor,
  currentHidden,
  defaultFormatter,
  formatCell,
  type Key,
  resolveColor,
  toggleIn,
  useChartAnimation,
  useChartParts,
} from './chart-parts'

type Row = Record<string, unknown>

export interface RadarChartProps<T extends object> extends ChartStateProps {
  data: readonly T[]
  /** Field naming each spoke, e.g. `"skill"`. */
  index: Key<T>
  series: readonly ChartSeries<T>[]
  title: string
  description?: ReactNode
  hideTitle?: boolean
  valueFormatter?: (value: number) => string
  /** Plot height in pixels. Default 280. */
  height?: number
  /** Upper bound of the radial axis. Defaults to the largest value. */
  max?: number
  showLegend?: boolean
  hiddenSeries?: readonly Key<T>[]
  defaultHiddenSeries?: readonly Key<T>[]
  onHiddenSeriesChange?: (hidden: Key<T>[]) => void
  className?: string
}

/** Compare a few items across several measures, e.g. plans by feature score. */
export function RadarChart<T extends object>(props: RadarChartProps<T>) {
  const { resolved, table, legend, onLegendToggle, valueFormatter } = useCartesian(props)
  const animation = useChartAnimation()
  const height = props.height ?? 280
  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      legend={legend}
      onLegendToggle={onLegendToggle}
      table={table}
      height={height}
      isEmpty={props.data.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <R.ResponsiveContainer width="100%" height={height}>
        <R.RadarChart accessibilityLayer={false} data={props.data as T[]} outerRadius="72%">
          <R.PolarGrid stroke="var(--glyph-border)" />
          <R.PolarAngleAxis
            dataKey={props.index}
            tick={{ fill: 'var(--glyph-muted-foreground)', fontSize: 12 }}
          />
          <R.PolarRadiusAxis
            angle={90}
            tick={false}
            axisLine={false}
            {...(props.max !== undefined && { domain: [0, props.max] })}
          />
          {chartTooltip(valueFormatter, false)}
          {resolved.map((item) => (
            <R.Radar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              hide={item.hidden}
              stroke={item.stroke}
              strokeWidth={2}
              fill={item.stroke}
              fillOpacity={0.14}
              dot={{ r: 3, fill: item.stroke, strokeWidth: 0 }}
              {...animation}
            />
          ))}
        </R.RadarChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}

export interface RadialBarChartProps<T extends object> extends ChartStateProps {
  data: readonly T[]
  /** Field naming each ring. */
  category: Key<T>
  /** Field holding each ring's value. */
  value: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  colors?: readonly ChartColorValue[]
  /** Value of a full ring. Defaults to the largest value. */
  max?: number
  valueFormatter?: (value: number) => string
  /** Diameter in pixels. Default 220. */
  size?: number
  centerLabel?: ReactNode
  showLegend?: boolean
  className?: string
}

/** Progress of a few items toward the same goal, as concentric rings. */
export function RadialBarChart<T extends object>(props: RadialBarChartProps<T>) {
  const { data, category, value, valueFormatter = defaultFormatter, size = 220 } = props
  const { s, slots } = useChartParts()
  const animation = useChartAnimation()
  const [hiddenState, setHidden] = useControllableState<readonly string[]>({ defaultValue: [] })
  const rows = data.map((row, i) => ({
    row: row as Row,
    name: String((row as Row)[category]),
    color: categoryColor(props.colors?.[i], i),
  }))
  const hidden = currentHidden(
    hiddenState,
    rows.map((item) => item.name),
  )
  const visible = rows.filter((item) => !hidden.includes(item.name))
  const max = props.max ?? Math.max(0, ...rows.map((item) => Number(item.row[value]) || 0))
  const table = {
    columns: [String(category), String(value)],
    rows: rows.map((item) => [item.name, formatCell(item.row[value], valueFormatter)]),
  }
  const legend =
    (props.showLegend ?? true)
      ? rows.map((item) => ({
          key: item.name,
          label: item.name,
          color: item.color,
          hidden: hidden.includes(item.name),
        }))
      : undefined
  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      legend={legend}
      onLegendToggle={
        rows.length > 1 ? (key) => setHidden(toggleIn(hidden, key, rows.length)) : undefined
      }
      table={table}
      height={size}
      isEmpty={data.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <div className="relative mx-auto" style={{ width: size, maxWidth: '100%', height: size }}>
        <R.ResponsiveContainer width="100%" height="100%">
          <R.RadialBarChart
            accessibilityLayer={false}
            data={visible.map((item) => ({ ...item.row, fill: item.color }))}
            innerRadius="30%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            barCategoryGap="22%"
          >
            <R.PolarAngleAxis type="number" domain={[0, max || 1]} tick={false} />
            {chartTooltip(valueFormatter, false)}
            <R.RadialBar
              dataKey={value}
              name={String(value)}
              background={{ fill: 'var(--glyph-muted)' }}
              cornerRadius={99}
              {...animation}
            >
              {visible.map((item) => (
                <R.Cell key={item.name} fill={item.color} name={item.name} />
              ))}
            </R.RadialBar>
          </R.RadialBarChart>
        </R.ResponsiveContainer>
        {props.centerLabel && (
          <div className={s.center({ class: slots.center })}>{props.centerLabel}</div>
        )}
      </div>
    </ChartFrame>
  )
}

export interface GaugeBand {
  /** Upper bound of this band. The last band runs to `max`. */
  to: number
  color: ChartColorValue
  /** Read out with the value, e.g. "Healthy". */
  label?: string
}

export interface GaugeProps {
  value: number
  min?: number
  max?: number
  /** Accessible name, also the caption. */
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** Colored ranges, e.g. healthy / slow / failing. The value arc takes its band's color. */
  bands?: readonly GaugeBand[]
  /** Color of the value arc when there are no bands. Default `chart-1`. */
  color?: ChartColorValue
  valueFormatter?: (value: number) => string
  /** Small text under the value, e.g. "p95 latency". */
  label?: ReactNode
  /** Width in pixels. Default 220. */
  size?: number
  className?: string
}

const ARC = 240
const START = 150

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number) {
  const a = polar(cx, cy, r, from)
  const b = polar(cx, cy, r, to)
  const large = to - from > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`
}

/** A single value against a range, e.g. latency, quota used or a health score. */
export function Gauge({
  value,
  min = 0,
  max = 100,
  title,
  description,
  hideTitle,
  bands,
  color,
  valueFormatter = defaultFormatter,
  label,
  size = 220,
  className,
}: GaugeProps) {
  const { s, slots } = useChartParts()
  const { animate } = useMotionSettings()
  const id = useId()
  const span = max - min || 1
  const clamped = Math.min(Math.max(value, min), max)
  const share = (clamped - min) / span
  // Start empty and sweep to the value once mounted, when the theme animates.
  const [shown, setShown] = useState(animate ? 0 : share)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(share))
    return () => cancelAnimationFrame(frame)
  }, [share])
  const band = bands?.find((item) => clamped <= item.to) ?? bands?.[bands.length - 1]
  const stroke = resolveColor(band?.color ?? color ?? 'chart-1', 0)
  const width = 200
  const r = 80
  const cx = 100
  const cy = 100
  const thickness = 14
  const length = (Math.PI * r * ARC) / 180
  const text = valueFormatter(value)
  const bandMarks: { from: number; to: number; color: string }[] = []
  if (bands?.length) {
    let previous = min
    for (const item of bands) {
      const to = Math.min(item.to, max)
      bandMarks.push({
        from: START + ((previous - min) / span) * ARC,
        to: START + ((to - min) / span) * ARC,
        color: resolveColor(item.color, 0),
      })
      previous = to
    }
  }
  return (
    <figure
      data-slot="gauge"
      aria-labelledby={`${id}-title`}
      className={s.root({ class: [slots.root, className] })}
    >
      <figcaption className={hideTitle ? s.srOnly() : s.caption({ class: slots.caption })}>
        <span id={`${id}-title`} className={s.title({ class: slots.title })}>
          {title}
        </span>
        {description && (
          <span className={s.description({ class: slots.description })}>{description}</span>
        )}
      </figcaption>
      {/* biome-ignore lint/a11y/useSemanticElements: a native <meter> can't draw the arc and bands */}
      <div
        role="meter"
        aria-labelledby={`${id}-title`}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={band?.label ? `${text}, ${band.label}` : text}
        className="relative mx-auto w-full"
        style={{ maxWidth: size }}
      >
        <svg viewBox={`0 0 ${width} 172`} className="block h-auto w-full" aria-hidden="true">
          <path
            d={arcPath(cx, cy, r, START, START + ARC)}
            fill="none"
            stroke="var(--glyph-muted)"
            strokeWidth={thickness}
            strokeLinecap="round"
          />
          {bandMarks.map((mark, i) => (
            <path
              key={i}
              d={arcPath(cx, cy, r + thickness / 2 + 5, mark.from + 0.5, mark.to - 0.5)}
              fill="none"
              stroke={mark.color}
              strokeWidth={3}
              strokeOpacity={0.55}
            />
          ))}
          <path
            data-slot="gauge-value"
            d={arcPath(cx, cy, r, START, START + ARC)}
            fill="none"
            stroke={stroke}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - shown)}
            style={
              animate
                ? {
                    transition:
                      'stroke-dashoffset calc(var(--glyph-duration-slow) * 2.5) var(--glyph-ease-emphasized), stroke var(--glyph-duration-base)',
                  }
                : undefined
            }
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex flex-col items-center text-center">
          <span className="font-display text-h3 tabular-nums text-foreground">{text}</span>
          {(label || band?.label) && (
            <span className="text-caption text-muted-foreground">{label ?? band?.label}</span>
          )}
        </div>
        <div className="flex justify-between px-[9%] text-caption text-muted-foreground tabular-nums">
          <span>{valueFormatter(min)}</span>
          <span>{valueFormatter(max)}</span>
        </div>
      </div>
    </figure>
  )
}
