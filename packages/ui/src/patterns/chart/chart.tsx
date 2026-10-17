import { type ReactNode, useId } from 'react'
import * as R from 'recharts'
import {
  type ChartColor,
  ChartFrame,
  ChartTooltipCard,
  defaultFormatter,
  resolveColor,
  useChartParts,
} from './chart-parts'

export type { ChartColor }

type Key<T> = Extract<keyof T, string>

export interface ChartSeries<T> {
  /** Field of each data row holding this series' value. */
  key: Key<T>
  /** Name shown in the legend, tooltip and accessible table. Defaults to `key`. */
  label?: string
  /** A theme color name (`primary`, `info`, ...) or any CSS color. Defaults follow the theme palette. */
  color?: ChartColor | (string & {})
}

export interface CartesianChartProps<T extends object> {
  data: readonly T[]
  /** Field used for the x axis, e.g. `"month"`. */
  index: Key<T>
  series: readonly ChartSeries<T>[]
  /** Accessible name; also shown as the caption unless `hideTitle` is set. */
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** Formats values on the y axis, in tooltips and in the accessible table. */
  valueFormatter?: (value: number) => string
  /** Plot height in pixels. Default 240. */
  height?: number
  showGrid?: boolean
  /** Defaults to true when there is more than one series. */
  showLegend?: boolean
  showYAxis?: boolean
  className?: string
}

const axisTick = { fill: 'var(--color-muted-foreground)', fontSize: 12 }

function useCartesian<T extends object>(props: CartesianChartProps<T>) {
  const { data, index, series, title, valueFormatter = defaultFormatter } = props
  const resolved = series.map((item, i) => ({
    ...item,
    label: item.label ?? item.key,
    stroke: resolveColor(item.color, i),
  }))
  const table = {
    columns: [String(index), ...resolved.map((item) => item.label)],
    rows: data.map((row) => [
      String((row as Record<string, unknown>)[index]),
      ...resolved.map((item) => valueFormatter(Number((row as Record<string, unknown>)[item.key]))),
    ]),
  }
  const legend =
    (props.showLegend ?? series.length > 1)
      ? resolved.map((item) => ({ label: item.label, color: item.stroke }))
      : undefined
  return { resolved, table, legend, valueFormatter, title }
}

function frameProps<T extends object>(props: CartesianChartProps<T>) {
  return {
    title: props.title,
    description: props.description,
    hideTitle: props.hideTitle,
    className: props.className,
  }
}

function Axes({
  index,
  showGrid = true,
  showYAxis = true,
  valueFormatter,
}: {
  index: string
  showGrid?: boolean | undefined
  showYAxis?: boolean | undefined
  valueFormatter: (value: number) => string
}) {
  return (
    <>
      {showGrid && (
        <R.CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
      )}
      <R.XAxis
        dataKey={index}
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={16}
      />
      {showYAxis && (
        <R.YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={valueFormatter}
        />
      )}
    </>
  )
}

function tooltip(valueFormatter: (value: number) => string, cursor: object | boolean) {
  return (
    <R.Tooltip
      cursor={cursor}
      content={(p) => (
        <ChartTooltipCard
          active={p.active}
          payload={p.payload as never}
          label={p.label as ReactNode}
          formatter={valueFormatter}
        />
      )}
    />
  )
}

/** Trends over time, one line per series. */
export function LineChart<T extends object>(
  props: CartesianChartProps<T> & { curve?: 'monotone' | 'linear' },
) {
  const { resolved, table, legend, valueFormatter } = useCartesian(props)
  return (
    <ChartFrame {...frameProps(props)} legend={legend} table={table}>
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.LineChart
          accessibilityLayer={false}
          data={props.data as T[]}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <Axes
            index={props.index}
            showGrid={props.showGrid}
            showYAxis={props.showYAxis}
            valueFormatter={valueFormatter}
          />
          {tooltip(valueFormatter, { stroke: 'var(--color-border-strong)' })}
          {resolved.map((item) => (
            <R.Line
              key={item.key}
              dataKey={item.key}
              name={item.label}
              type={props.curve ?? 'monotone'}
              stroke={item.stroke}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          ))}
        </R.LineChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}

/** Trends with filled areas. `stacked` shows how series add up to a total. */
export function AreaChart<T extends object>(props: CartesianChartProps<T> & { stacked?: boolean }) {
  const { resolved, table, legend, valueFormatter } = useCartesian(props)
  const id = useId().replace(/:/g, '')
  return (
    <ChartFrame {...frameProps(props)} legend={legend} table={table}>
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.AreaChart
          accessibilityLayer={false}
          data={props.data as T[]}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            {resolved.map((item, i) => (
              <linearGradient key={item.key} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={item.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={item.stroke} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <Axes
            index={props.index}
            showGrid={props.showGrid}
            showYAxis={props.showYAxis}
            valueFormatter={valueFormatter}
          />
          {tooltip(valueFormatter, { stroke: 'var(--color-border-strong)' })}
          {resolved.map((item, i) => (
            <R.Area
              key={item.key}
              dataKey={item.key}
              name={item.label}
              type="monotone"
              stroke={item.stroke}
              strokeWidth={2}
              fill={`url(#${id}-${i})`}
              {...(props.stacked && { stackId: 'stack' })}
              isAnimationActive={false}
            />
          ))}
        </R.AreaChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}

/** Compare values across categories. `stacked` puts series on top of each other. */
export function BarChart<T extends object>(
  props: CartesianChartProps<T> & {
    stacked?: boolean /** Corner radius of bar tops. Default 3. */
    barRadius?: number
  },
) {
  const { resolved, table, legend, valueFormatter } = useCartesian(props)
  const radius = props.barRadius ?? 3
  return (
    <ChartFrame {...frameProps(props)} legend={legend} table={table}>
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.BarChart
          accessibilityLayer={false}
          data={props.data as T[]}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <Axes
            index={props.index}
            showGrid={props.showGrid}
            showYAxis={props.showYAxis}
            valueFormatter={valueFormatter}
          />
          {tooltip(valueFormatter, { fill: 'var(--color-muted)', opacity: 0.6 })}
          {resolved.map((item, i) => (
            <R.Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.stroke}
              radius={props.stacked && i < resolved.length - 1 ? 0 : [radius, radius, 0, 0]}
              {...(props.stacked && { stackId: 'stack' })}
              isAnimationActive={false}
            />
          ))}
        </R.BarChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}

export interface DonutChartProps<T extends object> {
  data: readonly T[]
  /** Field naming each slice. */
  category: Key<T>
  /** Field holding each slice's value. */
  value: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** One color per slice, in order. Defaults follow the theme palette. */
  colors?: readonly (ChartColor | (string & {}))[]
  /** Content in the hole, e.g. the total. */
  centerLabel?: ReactNode
  valueFormatter?: (value: number) => string
  /** Diameter in pixels. Default 200. */
  size?: number
  showLegend?: boolean
  className?: string
}

/** Parts of a whole. Best with five or fewer slices. */
export function DonutChart<T extends object>(props: DonutChartProps<T>) {
  const { data, category, value, valueFormatter = defaultFormatter, size = 200 } = props
  const { s, slots } = useChartParts()
  const rows = data.map((row) => row as Record<string, unknown>)
  const colors = rows.map((_, i) => resolveColor(props.colors?.[i], i))
  const table = {
    columns: [String(category), String(value)],
    rows: rows.map((row) => [String(row[category]), valueFormatter(Number(row[value]))]),
  }
  const legend =
    (props.showLegend ?? true)
      ? rows.map((row, i) => ({ label: String(row[category]), color: colors[i]! }))
      : undefined
  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      legend={legend}
      table={table}
    >
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <R.ResponsiveContainer width="100%" height="100%">
          <R.PieChart accessibilityLayer={false}>
            {tooltip(valueFormatter, false)}
            <R.Pie
              rootTabIndex={-1}
              data={rows}
              dataKey={value}
              nameKey={category}
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {rows.map((_, i) => (
                <R.Cell key={i} fill={colors[i]} />
              ))}
            </R.Pie>
          </R.PieChart>
        </R.ResponsiveContainer>
        {props.centerLabel && (
          <div className={s.center({ class: slots.center })}>{props.centerLabel}</div>
        )}
      </div>
    </ChartFrame>
  )
}

export interface SparklineProps {
  values: readonly number[]
  /** Accessible description, e.g. "Revenue over the last 12 months, rising". */
  title: string
  color?: ChartColor | (string & {})
  /** Height in pixels. Default 36. */
  height?: number
  /** Fill the area under the line. */
  area?: boolean
  className?: string
}

/** A tiny trend line without axes, for stat cards and table cells. */
export function Sparkline({
  values,
  title,
  color,
  height = 36,
  area = true,
  className,
}: SparklineProps) {
  const id = useId().replace(/:/g, '')
  const stroke = resolveColor(color, 0)
  const data = values.map((v, i) => ({ i, v }))
  return (
    <div
      role="img"
      aria-label={title}
      data-slot="sparkline"
      className={className}
      style={{ height }}
    >
      <R.ResponsiveContainer width="100%" height="100%">
        <R.AreaChart
          accessibilityLayer={false}
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={area ? 0.25 : 0} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <R.Area
            dataKey="v"
            type="monotone"
            stroke={stroke}
            strokeWidth={1.75}
            fill={`url(#${id})`}
            isAnimationActive={false}
            dot={false}
          />
        </R.AreaChart>
      </R.ResponsiveContainer>
    </div>
  )
}
