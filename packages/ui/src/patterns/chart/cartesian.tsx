import { type ReactNode, useId, useMemo } from 'react'
import * as R from 'recharts'
import { useControllableState } from '../../hooks/use-controllable-state'
import { useFontsVersion } from '../../hooks/use-fonts-version'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  ChartTooltipCard,
  currentHidden,
  defaultFormatter,
  formatCell,
  type Key,
  resolveColor,
  toggleIn,
  useChartAnimation,
} from './chart-parts'

export interface ChartSeries<T> {
  /** Field of each data row holding this series' value. */
  key: Key<T>
  /** Name shown in the legend, tooltip and accessible table. Defaults to `key`. */
  label?: string
  /** A theme color name (`chart-2`, `primary`, ...) or any CSS color. Defaults follow the theme palette. */
  color?: ChartColorValue
}

type AxisBound = number | 'auto' | 'dataMin' | 'dataMax'

export interface ChartAxisOptions {
  hide?: boolean
  /** Formats tick labels. The y axis defaults to `valueFormatter`. */
  formatter?: (value: never) => string
  /** Axis title. */
  label?: string
  /** Y axis only: width reserved for tick labels, in pixels. Default 48. */
  width?: number
  /** Y axis only: fixed range, e.g. `[0, 100]` or `[0, 'auto']`. */
  domain?: readonly [AxisBound, AxisBound]
  allowDecimals?: boolean
  tickCount?: number
}

export interface ChartReferenceLine {
  /** Horizontal line at this value. */
  y?: number
  /** Vertical line at this category (x value). */
  x?: string | number
  label?: string
  color?: ChartColorValue
  /** Default true. */
  dashed?: boolean
}

export interface ChartReferenceArea {
  x1?: string | number
  x2?: string | number
  y1?: number
  y2?: number
  label?: string
  color?: ChartColorValue
}

export interface ChartBrushOptions {
  /** First and last visible row when the chart mounts. */
  startIndex?: number
  endIndex?: number
  /** Height of the brush in pixels. Default 28. */
  height?: number
}

export interface CartesianChartProps<T extends object> extends ChartStateProps {
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
  /** Formats the x value at the top of the tooltip. */
  labelFormatter?: (label: ReactNode) => ReactNode
  /** Plot height in pixels. Default 240. */
  height?: number
  showGrid?: boolean
  /** Defaults to true when there is more than one series. */
  showLegend?: boolean
  /** Shorthand for `yAxis={{ hide: !showYAxis }}`. */
  showYAxis?: boolean
  xAxis?: ChartAxisOptions
  yAxis?: ChartAxisOptions
  /** Adds a range slider under the plot to zoom into part of the data. */
  brush?: boolean | ChartBrushOptions
  /** Targets, limits, averages... drawn across the plot. */
  referenceLines?: readonly ChartReferenceLine[]
  /** Shaded ranges, e.g. a launch window or an incident. */
  referenceAreas?: readonly ChartReferenceArea[]
  /** Series hidden through the legend (controlled). */
  hiddenSeries?: readonly Key<T>[]
  defaultHiddenSeries?: readonly Key<T>[]
  onHiddenSeriesChange?: (hidden: Key<T>[]) => void
  /** Charts with the same `syncId` share their tooltip and brush position. */
  syncId?: string
  /** Called with the row (and series, when known) the user clicked. */
  onPointClick?: (row: T, seriesKey?: Key<T>) => void
  className?: string
}

export const axisTick = { fill: 'var(--glyph-muted-foreground)', fontSize: 12 }
const margin = { top: 8, right: 8, bottom: 0, left: 0 }
/** Reference labels sit on top of data: a surface-colored halo keeps them readable. */
const halo = {
  stroke: 'var(--glyph-surface)',
  strokeWidth: 3,
  strokeLinejoin: 'round',
  paintOrder: 'stroke',
} as const

type Row = Record<string, unknown>

/** Shared setup for every cartesian chart: colors, legend, table, hidden series. */
export function useCartesian<T extends object, S extends ChartSeries<T>>(
  props: Omit<CartesianChartProps<T>, 'series'> & { series: readonly S[] },
) {
  const { data, index, series, valueFormatter = defaultFormatter } = props
  // The y axis is sized from measured label text; re-render once web fonts have loaded.
  useFontsVersion()
  const [hidden, setHidden] = useControllableState<readonly Key<T>[]>({
    value: props.hiddenSeries,
    defaultValue: props.defaultHiddenSeries ?? [],
    onChange: props.onHiddenSeriesChange as ((value: readonly Key<T>[]) => void) | undefined,
  })
  const visibleHidden = useMemo(
    () =>
      currentHidden(
        hidden,
        series.map((item) => item.key),
      ),
    [series, hidden],
  )
  const resolved = useMemo(
    () =>
      series.map((item, i) => ({
        ...item,
        label: item.label ?? item.key,
        stroke: resolveColor(item.color, i),
        hidden: visibleHidden.includes(item.key),
      })),
    [series, visibleHidden],
  )
  const table = {
    columns: [String(index), ...resolved.map((item) => item.label)],
    rows: data.map((row) => [
      String((row as Row)[index]),
      ...resolved.map((item) => formatCell((row as Row)[item.key], valueFormatter)),
    ]),
  }
  const showLegend = props.showLegend ?? series.length > 1
  const legend = showLegend
    ? resolved.map((item) => ({
        key: item.key,
        label: item.label,
        color: item.stroke,
        hidden: item.hidden,
      }))
    : undefined
  const onLegendToggle =
    series.length > 1
      ? (key: string) => setHidden(toggleIn(visibleHidden, key as Key<T>, series.length))
      : undefined
  return { resolved, table, legend, onLegendToggle, valueFormatter }
}

export function frameProps<T extends object>(
  props: Pick<
    CartesianChartProps<T>,
    | 'title'
    | 'description'
    | 'hideTitle'
    | 'className'
    | 'loading'
    | 'error'
    | 'onRetry'
    | 'empty'
    | 'height'
    | 'data'
  >,
) {
  return {
    title: props.title,
    description: props.description,
    hideTitle: props.hideTitle,
    className: props.className,
    loading: props.loading,
    error: props.error,
    onRetry: props.onRetry,
    empty: props.empty,
    height: props.height ?? 240,
    isEmpty: props.data.length === 0,
  } as const
}

/** recharts props that every cartesian chart root shares. */
export function rootProps<T extends object>(props: CartesianChartProps<T>) {
  const { onPointClick, data, syncId } = props
  return {
    accessibilityLayer: false,
    data: data as T[],
    margin,
    ...(syncId && { syncId }),
    ...(onPointClick && {
      style: { cursor: 'pointer' },
      onClick: (state: { activeTooltipIndex?: unknown; activeDataKey?: unknown } | null) => {
        const i = Number(state?.activeTooltipIndex)
        const row = Number.isInteger(i) ? data[i] : undefined
        if (!row) return
        const key = typeof state?.activeDataKey === 'string' ? state.activeDataKey : undefined
        onPointClick(row, key as Key<T> | undefined)
      },
    }),
  }
}

/**
 * Width that fits the longest y tick label, estimated from the formatted data range, so
 * labels like "340 ms" or "$1.2M" never wrap.
 */
export function axisWidth(
  data: readonly object[],
  keys: readonly string[],
  formatter: (value: number) => string,
  extra = 0,
): number {
  let min = 0
  let max = 0
  let stacked = 0
  for (const row of data as readonly Row[]) {
    let sum = 0
    for (const key of keys) {
      const value = Number(row[key])
      if (!Number.isFinite(value)) continue
      min = Math.min(min, value)
      max = Math.max(max, value)
      sum += Math.max(value, 0)
    }
    stacked = Math.max(stacked, sum)
  }
  // Ticks round up to "nice" numbers, so pad the top a little.
  const candidates = [min, max * 1.2, stacked * 1.2].map((value) => {
    const magnitude = 10 ** Math.max(Math.floor(Math.log10(Math.abs(value) || 1)) - 1, 0)
    return formatter(Math.ceil(value / magnitude) * magnitude)
  })
  const widest = Math.max(...candidates.map((label) => textWidth(String(label))))
  return Math.min(Math.max(Math.ceil(widest) + 16 + extra, 36), 128)
}

let measureContext: CanvasRenderingContext2D | null | undefined

/** Width of a 12px tick label in the page's font; an estimate where canvas is unavailable. */
function textWidth(text: string): number {
  if (measureContext === undefined) {
    measureContext =
      typeof document !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined'
        ? document.createElement('canvas').getContext('2d')
        : null
  }
  if (!measureContext) return text.length * 7
  measureContext.font = `12px ${getComputedStyle(document.body).fontFamily}`
  return measureContext.measureText(text).width
}

/** Grid and axes. Rendered as an array so recharts sees its own components as direct children. */
export function axes<T extends object>(
  props: CartesianChartProps<T>,
  valueFormatter: (value: number) => string,
  { rightAxis }: { rightAxis?: ChartAxisOptions | undefined } = {},
) {
  const { xAxis = {}, yAxis = {} } = props
  const hideY = yAxis.hide ?? props.showYAxis === false
  const nodes: ReactNode[] = []
  if (props.showGrid ?? true) {
    nodes.push(
      <R.CartesianGrid
        key="grid"
        vertical={false}
        stroke="var(--glyph-border)"
        strokeDasharray="3 3"
        yAxisId="left"
      />,
    )
  }
  nodes.push(
    <R.XAxis
      key="x"
      dataKey={props.index}
      hide={xAxis.hide}
      tick={axisTick}
      tickLine={false}
      axisLine={false}
      tickMargin={8}
      minTickGap={16}
      {...(xAxis.formatter && { tickFormatter: xAxis.formatter as (v: unknown) => string })}
      {...(xAxis.label && {
        label: { value: xAxis.label, position: 'insideBottom', offset: -4, ...axisTick },
        height: 44,
      })}
    />,
    <R.YAxis
      key="y"
      yAxisId="left"
      hide={hideY}
      tick={axisTick}
      tickLine={false}
      axisLine={false}
      width={
        yAxis.width ??
        axisWidth(
          props.data,
          props.series
            .filter((item) => (item as { axis?: string }).axis !== 'right')
            .map((item) => item.key),
          (yAxis.formatter as ((v: number) => string) | undefined) ?? valueFormatter,
          yAxis.label ? 18 : 0,
        )
      }
      tickFormatter={(yAxis.formatter as ((v: number) => string) | undefined) ?? valueFormatter}
      {...(yAxis.domain && { domain: yAxis.domain as [AxisBound, AxisBound] })}
      {...(yAxis.allowDecimals !== undefined && { allowDecimals: yAxis.allowDecimals })}
      {...(yAxis.tickCount !== undefined && { tickCount: yAxis.tickCount })}
      {...(yAxis.label && {
        label: { value: yAxis.label, angle: -90, position: 'insideLeft', ...axisTick },
      })}
    />,
  )
  if (rightAxis) {
    nodes.push(
      <R.YAxis
        key="y-right"
        yAxisId="right"
        orientation="right"
        hide={rightAxis.hide}
        tick={axisTick}
        tickLine={false}
        axisLine={false}
        width={
          rightAxis.width ??
          axisWidth(
            props.data,
            props.series
              .filter((item) => (item as { axis?: string }).axis === 'right')
              .map((item) => item.key),
            (rightAxis.formatter as ((v: number) => string) | undefined) ?? valueFormatter,
            rightAxis.label ? 18 : 0,
          )
        }
        tickFormatter={
          (rightAxis.formatter as ((v: number) => string) | undefined) ?? valueFormatter
        }
        {...(rightAxis.domain && { domain: rightAxis.domain as [AxisBound, AxisBound] })}
        {...(rightAxis.label && {
          label: { value: rightAxis.label, angle: 90, position: 'insideRight', ...axisTick },
        })}
      />,
    )
  }
  return nodes
}

/** Reference lines, areas and the brush. */
export function overlays<T extends object>(props: CartesianChartProps<T>) {
  const nodes: ReactNode[] = []
  props.referenceAreas?.forEach((area, i) => {
    const color = resolveColor(area.color ?? 'muted-foreground', 0)
    nodes.push(
      <R.ReferenceArea
        key={`area-${i}`}
        yAxisId="left"
        {...(area.x1 !== undefined && { x1: area.x1 })}
        {...(area.x2 !== undefined && { x2: area.x2 })}
        {...(area.y1 !== undefined && { y1: area.y1 })}
        {...(area.y2 !== undefined && { y2: area.y2 })}
        fill={color}
        fillOpacity={0.08}
        stroke="none"
        ifOverflow="extendDomain"
        {...(area.label && {
          label: { value: area.label, position: 'insideTop', ...axisTick, fontSize: 11, ...halo },
        })}
      />,
    )
  })
  props.referenceLines?.forEach((line, i) => {
    const color = resolveColor(line.color ?? 'muted-foreground', 0)
    nodes.push(
      <R.ReferenceLine
        key={`line-${i}`}
        yAxisId="left"
        {...(line.y !== undefined && { y: line.y })}
        {...(line.x !== undefined && { x: line.x })}
        stroke={color}
        strokeWidth={1.25}
        strokeDasharray={line.dashed === false ? undefined : '4 4'}
        ifOverflow="extendDomain"
        {...(line.label && {
          label: {
            value: line.label,
            position: line.y !== undefined ? 'insideTopRight' : 'insideTopLeft',
            fill: 'var(--glyph-muted-foreground)',
            fontSize: 11,
            ...halo,
          },
        })}
      />,
    )
  })
  if (props.brush) {
    const options = props.brush === true ? {} : props.brush
    nodes.push(
      <R.Brush
        key="brush"
        dataKey={props.index}
        height={options.height ?? 28}
        stroke="var(--glyph-border-strong)"
        fill="var(--glyph-subtle)"
        travellerWidth={8}
        tickFormatter={() => ''}
        {...(options.startIndex !== undefined && { startIndex: options.startIndex })}
        {...(options.endIndex !== undefined && { endIndex: options.endIndex })}
      />,
    )
  }
  return nodes
}

export function chartTooltip(
  valueFormatter: (value: number) => string,
  cursor: object | boolean,
  options: {
    total?: boolean | undefined
    labelFormatter?: ((label: ReactNode) => ReactNode) | undefined
  } = {},
) {
  return (
    <R.Tooltip
      cursor={cursor}
      isAnimationActive={false}
      content={(p) => (
        <ChartTooltipCard
          active={p.active}
          payload={p.payload as never}
          label={p.label as ReactNode}
          formatter={valueFormatter}
          labelFormatter={options.labelFormatter}
          total={options.total}
        />
      )}
    />
  )
}

const lineCursor = { stroke: 'var(--glyph-border-strong)' }
const barCursor = { fill: 'var(--glyph-muted)', opacity: 0.6 }

/** Trends over time, one line per series. */
export function LineChart<T extends object>(
  props: CartesianChartProps<T> & {
    curve?: 'monotone' | 'linear' | 'step'
    /** Show a dot on every data point. Default false. */
    dots?: boolean
  },
) {
  const { resolved, table, legend, onLegendToggle, valueFormatter } = useCartesian(props)
  const animation = useChartAnimation()
  return (
    <ChartFrame
      {...frameProps(props)}
      legend={legend}
      onLegendToggle={onLegendToggle}
      table={table}
    >
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.LineChart {...rootProps(props)}>
          {axes(props, valueFormatter)}
          {chartTooltip(valueFormatter, lineCursor, { labelFormatter: props.labelFormatter })}
          {overlays(props)}
          {resolved.map((item) => (
            <R.Line
              key={item.key}
              yAxisId="left"
              dataKey={item.key}
              name={item.label}
              hide={item.hidden}
              type={props.curve === 'step' ? 'stepAfter' : (props.curve ?? 'monotone')}
              stroke={item.stroke}
              strokeWidth={2}
              dot={props.dots ? { r: 3, strokeWidth: 0, fill: item.stroke } : false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--glyph-surface)' }}
              {...animation}
            />
          ))}
        </R.LineChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}

/** Trends with filled areas. `stacked` shows how series add up to a total. */
export function AreaChart<T extends object>(
  props: CartesianChartProps<T> & {
    stacked?: boolean
    /** Stack to 100% to compare shares over time. */
    expand?: boolean
    curve?: 'monotone' | 'linear' | 'step'
  },
) {
  const { resolved, table, legend, onLegendToggle, valueFormatter } = useCartesian(props)
  const animation = useChartAnimation()
  const id = useId().replace(/:/g, '')
  const stacked = props.stacked || props.expand
  return (
    <ChartFrame
      {...frameProps(props)}
      legend={legend}
      onLegendToggle={onLegendToggle}
      table={table}
    >
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.AreaChart {...rootProps(props)} {...(props.expand && { stackOffset: 'expand' })}>
          <defs>
            {resolved.map((item, i) => (
              <linearGradient key={item.key} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={item.stroke} stopOpacity={stacked ? 0.45 : 0.3} />
                <stop offset="100%" stopColor={item.stroke} stopOpacity={stacked ? 0.12 : 0} />
              </linearGradient>
            ))}
          </defs>
          {axes(
            props.expand
              ? {
                  ...props,
                  yAxis: { formatter: (v: number) => `${Math.round(v * 100)}%`, ...props.yAxis },
                }
              : props,
            valueFormatter,
          )}
          {chartTooltip(valueFormatter, lineCursor, {
            total: stacked && !props.expand,
            labelFormatter: props.labelFormatter,
          })}
          {overlays(props)}
          {resolved.map((item, i) => (
            <R.Area
              key={item.key}
              yAxisId="left"
              dataKey={item.key}
              name={item.label}
              hide={item.hidden}
              type={props.curve === 'step' ? 'stepAfter' : (props.curve ?? 'monotone')}
              stroke={item.stroke}
              strokeWidth={2}
              fill={`url(#${id}-${i})`}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--glyph-surface)' }}
              {...(stacked && { stackId: 'stack' })}
              {...animation}
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
    stacked?: boolean
    /** Bars run left to right, categories down the side. Good for long labels. */
    layout?: 'vertical' | 'horizontal'
    /** Corner radius of bar ends. Default 4. */
    barRadius?: number
  },
) {
  const { resolved, table, legend, onLegendToggle, valueFormatter } = useCartesian(props)
  const animation = useChartAnimation()
  const radius = props.barRadius ?? 4
  const horizontal = props.layout === 'vertical'
  const visible = resolved.filter((item) => !item.hidden)
  const top = visible[visible.length - 1]?.key
  const endRadius = (key: string): number | [number, number, number, number] => {
    if (props.stacked && key !== top) return 0
    return horizontal ? [0, radius, radius, 0] : [radius, radius, 0, 0]
  }
  const { xAxis = {}, yAxis = {} } = props
  return (
    <ChartFrame
      {...frameProps(props)}
      legend={legend}
      onLegendToggle={onLegendToggle}
      table={table}
    >
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.BarChart
          {...rootProps(props)}
          layout={horizontal ? 'vertical' : 'horizontal'}
          barGap={2}
          barCategoryGap="24%"
        >
          {horizontal
            ? [
                (props.showGrid ?? true) && (
                  <R.CartesianGrid
                    key="grid"
                    horizontal={false}
                    stroke="var(--glyph-border)"
                    strokeDasharray="3 3"
                    yAxisId="left"
                  />
                ),
                <R.XAxis
                  key="x"
                  type="number"
                  hide={yAxis.hide ?? props.showYAxis === false}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={
                    (yAxis.formatter as ((v: number) => string) | undefined) ?? valueFormatter
                  }
                  {...(yAxis.domain && { domain: yAxis.domain as [AxisBound, AxisBound] })}
                />,
                <R.YAxis
                  key="y"
                  yAxisId="left"
                  type="category"
                  dataKey={props.index}
                  hide={xAxis.hide}
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={xAxis.width ?? yAxis.width ?? 96}
                  {...(xAxis.formatter && {
                    tickFormatter: xAxis.formatter as (v: unknown) => string,
                  })}
                />,
              ]
            : axes(props, valueFormatter)}
          {chartTooltip(valueFormatter, barCursor, {
            total: props.stacked,
            labelFormatter: props.labelFormatter,
          })}
          {overlays(props)}
          {resolved.map((item) => (
            <R.Bar
              key={item.key}
              yAxisId="left"
              dataKey={item.key}
              name={item.label}
              hide={item.hidden}
              fill={item.stroke}
              radius={endRadius(item.key)}
              maxBarSize={48}
              {...(props.stacked && { stackId: 'stack' })}
              {...animation}
            />
          ))}
        </R.BarChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}

export interface ComposedSeries<T> extends ChartSeries<T> {
  /** How this series is drawn. Default `bar`. */
  type?: 'bar' | 'line' | 'area'
  /**
   * Which y axis this series uses. Use the right axis sparingly: two scales on one plot
   * are easy to misread. Prefer two charts with a shared `syncId` when you can.
   */
  axis?: 'left' | 'right'
}

export interface ComposedChartProps<T extends object>
  extends Omit<CartesianChartProps<T>, 'series'> {
  series: readonly ComposedSeries<T>[]
  /** Options for the right y axis, used by series with `axis: "right"`. */
  rightAxis?: ChartAxisOptions
  /** Stack the bar series. */
  stacked?: boolean
}

/** Bars, lines and areas on one plot, e.g. revenue bars with a target line. */
export function ComposedChart<T extends object>(props: ComposedChartProps<T>) {
  const { resolved, table, legend, onLegendToggle, valueFormatter } = useCartesian(props)
  const animation = useChartAnimation()
  const id = useId().replace(/:/g, '')
  const hasRight = props.series.some((item) => item.axis === 'right')
  const cartesian = props as unknown as CartesianChartProps<T>
  return (
    <ChartFrame
      {...frameProps(props)}
      legend={legend}
      onLegendToggle={onLegendToggle}
      table={table}
    >
      <R.ResponsiveContainer width="100%" height={props.height ?? 240}>
        <R.ComposedChart {...rootProps(cartesian)} barGap={2} barCategoryGap="24%">
          <defs>
            {resolved.map((item, i) => (
              <linearGradient key={item.key} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={item.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={item.stroke} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {axes(cartesian, valueFormatter, {
            rightAxis: hasRight ? (props.rightAxis ?? {}) : undefined,
          })}
          {chartTooltip(valueFormatter, barCursor, { labelFormatter: props.labelFormatter })}
          {overlays(cartesian)}
          {resolved.map((item, i) => {
            const common = {
              yAxisId: item.axis === 'right' ? 'right' : 'left',
              dataKey: item.key,
              name: item.label,
              hide: item.hidden,
              ...animation,
            }
            if (item.type === 'line')
              return (
                <R.Line
                  key={item.key}
                  {...common}
                  type="monotone"
                  stroke={item.stroke}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--glyph-surface)' }}
                />
              )
            if (item.type === 'area')
              return (
                <R.Area
                  key={item.key}
                  {...common}
                  type="monotone"
                  stroke={item.stroke}
                  strokeWidth={2}
                  fill={`url(#${id}-${i})`}
                />
              )
            return (
              <R.Bar
                key={item.key}
                {...common}
                fill={item.stroke}
                radius={props.stacked ? 0 : [4, 4, 0, 0]}
                maxBarSize={48}
                {...(props.stacked && { stackId: 'bars' })}
              />
            )
          })}
        </R.ComposedChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}
