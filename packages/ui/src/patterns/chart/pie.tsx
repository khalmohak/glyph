import type { ReactNode } from 'react'
import * as R from 'recharts'
import { useControllableState } from '../../hooks/use-controllable-state'
import { chartTooltip } from './cartesian'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  categoryColor,
  currentHidden,
  defaultFormatter,
  formatCell,
  type Key,
  toggleIn,
  useChartAnimation,
  useChartParts,
} from './chart-parts'

export interface PieChartProps<T extends object> extends ChartStateProps {
  data: readonly T[]
  /** Field naming each slice. */
  category: Key<T>
  /** Field holding each slice's value. */
  value: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** One color per slice, in order. Defaults follow the theme palette. */
  colors?: readonly ChartColorValue[]
  /** Content in the middle of a donut, e.g. the total. */
  centerLabel?: ReactNode
  valueFormatter?: (value: number) => string
  /** Diameter in pixels. Default 200. */
  size?: number
  /** Hole size as a share of the radius, from 0 (pie) to 0.9. Default 0 for PieChart. */
  innerRadius?: number
  /** Text drawn next to each slice. Default `none`. */
  labels?: 'none' | 'percent' | 'value' | 'name'
  showLegend?: boolean
  /** Slices hidden through the legend (controlled), by category name. */
  hiddenSlices?: readonly string[]
  onHiddenSlicesChange?: (hidden: string[]) => void
  onSliceClick?: (row: T) => void
  className?: string
}

export type DonutChartProps<T extends object> = PieChartProps<T>

type Row = Record<string, unknown>

/** Parts of a whole. Best with five or fewer slices; fold the rest into "Other". */
export function PieChart<T extends object>(props: PieChartProps<T>) {
  const {
    data,
    category,
    value,
    valueFormatter = defaultFormatter,
    size = 200,
    innerRadius = 0,
    labels = 'none',
  } = props
  const { s, slots } = useChartParts()
  const animation = useChartAnimation()
  const [hiddenState, setHidden] = useControllableState<readonly string[]>({
    value: props.hiddenSlices,
    defaultValue: [],
    onChange: props.onHiddenSlicesChange as ((value: readonly string[]) => void) | undefined,
  })
  const rows = data.map((row) => row as Row)
  // Color follows the slice, not its position after hiding others.
  const colored = rows.map((row, i) => ({
    row,
    name: String(row[category]),
    color: categoryColor(props.colors?.[i], i),
  }))
  const hidden = currentHidden(
    hiddenState,
    colored.map((item) => item.name),
  )
  const visible = colored.filter((item) => !hidden.includes(item.name))
  const total = visible.reduce((sum, item) => sum + (Number(item.row[value]) || 0), 0)
  const table = {
    columns: [String(category), String(value)],
    rows: rows.map((row) => [String(row[category]), formatCell(row[value], valueFormatter)]),
  }
  const legend =
    (props.showLegend ?? true)
      ? colored.map((item) => ({
          key: item.name,
          label: item.name,
          color: item.color,
          hidden: hidden.includes(item.name),
        }))
      : undefined
  const ring = Math.min(Math.max(innerRadius, 0), 0.9)
  const labelText = (entry: { value?: number; name?: string; percent?: number }) => {
    if (labels === 'percent') return `${Math.round((entry.percent ?? 0) * 100)}%`
    if (labels === 'value') return valueFormatter(Number(entry.value))
    if (labels === 'name') return String(entry.name ?? '')
    return ''
  }
  const outer = labels === 'none' ? '100%' : '78%'
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
      isEmpty={data.length === 0 || total === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <div
        className="relative mx-auto"
        style={{ width: '100%', maxWidth: labels === 'none' ? size : size * 1.6, height: size }}
      >
        <R.ResponsiveContainer width="100%" height="100%">
          <R.PieChart accessibilityLayer={false}>
            {chartTooltip(valueFormatter, false)}
            <R.Pie
              rootTabIndex={-1}
              data={visible.map((item) => ({ ...item.row, fill: item.color }))}
              dataKey={value}
              nameKey={category}
              innerRadius={`${Math.round(ring * 100)}%`}
              outerRadius={outer}
              paddingAngle={ring > 0 ? 2 : 0}
              cornerRadius={ring > 0 ? 3 : 0}
              stroke="var(--glyph-surface)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              activeShape={(shape: R.PieSectorDataItem) => (
                <R.Sector {...shape} outerRadius={Number(shape.outerRadius ?? 0) + 5} />
              )}
              {...(props.onSliceClick && {
                onClick: (_: unknown, i: number) => {
                  const item = visible[i]
                  if (item) props.onSliceClick?.(item.row as T)
                },
                style: { cursor: 'pointer' },
              })}
              {...(labels !== 'none' && {
                label: (entry: { value?: number; name?: string; percent?: number }) =>
                  labelText(entry),
                labelLine: { stroke: 'var(--glyph-border-strong)' },
              })}
              {...animation}
            >
              {visible.map((item) => (
                <R.Cell key={item.name} fill={item.color} />
              ))}
            </R.Pie>
          </R.PieChart>
        </R.ResponsiveContainer>
        {props.centerLabel && ring > 0 && (
          <div className={s.center({ class: slots.center })}>{props.centerLabel}</div>
        )}
      </div>
    </ChartFrame>
  )
}

/** A pie with a hole for a headline number. Same props as PieChart; `innerRadius` defaults to 0.68. */
export function DonutChart<T extends object>(props: DonutChartProps<T>) {
  return <PieChart {...props} innerRadius={props.innerRadius ?? 0.68} />
}
