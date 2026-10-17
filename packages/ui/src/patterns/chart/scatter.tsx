import { type ReactNode, useMemo } from 'react'
import * as R from 'recharts'
import { useControllableState } from '../../hooks/use-controllable-state'
import {
  axisTick,
  axisWidth,
  type CartesianChartProps,
  type ChartAxisOptions,
  type ChartReferenceArea,
  type ChartReferenceLine,
  overlays,
} from './cartesian'
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

type Row = Record<string, unknown>

export interface ScatterChartProps<T extends object> extends ChartStateProps {
  data: readonly T[]
  /** Field for the horizontal position. */
  x: Key<T>
  /** Field for the vertical position. */
  y: Key<T>
  /** Field for the point size. Turns the scatter into a bubble chart. */
  size?: Key<T>
  /** Field naming each point, shown in the tooltip. */
  name?: Key<T>
  /** Field that splits points into colored groups with a legend. */
  groupBy?: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** Axis titles and tick formatters. Name the axes: a scatter has no other labels. */
  xAxis?: ChartAxisOptions
  yAxis?: ChartAxisOptions
  /** Smallest and largest bubble area in pixels. Default `[40, 600]`. */
  sizeRange?: readonly [number, number]
  /** One color per group, in order. */
  colors?: readonly ChartColorValue[]
  /** Formats `size` in the tooltip. */
  sizeFormatter?: (value: number) => string
  referenceLines?: readonly ChartReferenceLine[]
  referenceAreas?: readonly ChartReferenceArea[]
  /** Plot height in pixels. Default 280. */
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  hiddenGroups?: readonly string[]
  onHiddenGroupsChange?: (hidden: string[]) => void
  onPointClick?: (row: T) => void
  className?: string
}

interface ScatterTooltipProps {
  active?: boolean
  payload?: readonly { payload?: Row }[]
}

/** How two measures relate, one dot per item. Add `size` for a third measure. */
export function ScatterChart<T extends object>(props: ScatterChartProps<T>) {
  const { data, x, y, size, name, groupBy, height = 280 } = props
  const { s, slots } = useChartParts()
  const animation = useChartAnimation()
  const [hiddenState, setHidden] = useControllableState<readonly string[]>({
    value: props.hiddenGroups,
    defaultValue: [],
    onChange: props.onHiddenGroupsChange as ((value: readonly string[]) => void) | undefined,
  })
  const xFormat =
    (props.xAxis?.formatter as ((v: number) => string) | undefined) ?? defaultFormatter
  const yFormat =
    (props.yAxis?.formatter as ((v: number) => string) | undefined) ?? defaultFormatter
  const sizeFormat = props.sizeFormatter ?? defaultFormatter
  const groups = useMemo(() => {
    const order: string[] = []
    const byGroup = new Map<string, Row[]>()
    for (const row of data as readonly Row[]) {
      const key = groupBy ? String(row[groupBy]) : props.title
      if (!byGroup.has(key)) {
        byGroup.set(key, [])
        order.push(key)
      }
      byGroup.get(key)!.push(row)
    }
    return order.map((key, i) => ({
      key,
      rows: byGroup.get(key)!,
      color: categoryColor(props.colors?.[i], i),
    }))
  }, [data, groupBy, props.colors, props.title])
  const hidden = currentHidden(
    hiddenState,
    groups.map((group) => group.key),
  )

  const columns = [
    ...(name ? [String(name)] : []),
    ...(groupBy ? [String(groupBy)] : []),
    props.xAxis?.label ?? String(x),
    props.yAxis?.label ?? String(y),
    ...(size ? [String(size)] : []),
  ]
  const table = {
    columns: name || groupBy ? columns : ['#', ...columns],
    rows: (data as readonly Row[]).map((row, i) => [
      ...(name ? [String(row[name])] : []),
      ...(groupBy ? [String(row[groupBy])] : []),
      ...(name || groupBy ? [] : [i + 1]),
      formatCell(row[x], xFormat),
      formatCell(row[y], yFormat),
      ...(size ? [formatCell(row[size], sizeFormat)] : []),
    ]),
  }
  const legend =
    (props.showLegend ?? groups.length > 1)
      ? groups.map((group) => ({
          key: group.key,
          label: group.key,
          color: group.color,
          hidden: hidden.includes(group.key),
        }))
      : undefined
  const cartesian = props as unknown as CartesianChartProps<T>

  const content = ({ active, payload }: ScatterTooltipProps) => {
    const row = payload?.[0]?.payload
    if (!active || !row) return null
    const lines: [string, string][] = [
      [props.xAxis?.label ?? String(x), xFormat(Number(row[x]))],
      [props.yAxis?.label ?? String(y), yFormat(Number(row[y]))],
      ...(size ? [[String(size), sizeFormat(Number(row[size]))] as [string, string]] : []),
    ]
    return (
      <div data-slot="chart-tooltip" className={s.tooltip({ class: slots.tooltip })}>
        {(name || groupBy) && (
          <p className={s.tooltipLabel({ class: slots.tooltipLabel })}>
            {String(row[name ?? groupBy!])}
          </p>
        )}
        {lines.map(([label, value]) => (
          <div key={label} className={s.tooltipRow({ class: slots.tooltipRow })}>
            <span className={s.tooltipName({ class: slots.tooltipName })}>{label}</span>
            <span className={s.tooltipValue({ class: slots.tooltipValue })}>{value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      legend={legend}
      onLegendToggle={
        groups.length > 1 ? (key) => setHidden(toggleIn(hidden, key, groups.length)) : undefined
      }
      table={table}
      height={height}
      isEmpty={data.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <R.ResponsiveContainer width="100%" height={height}>
        <R.ScatterChart
          accessibilityLayer={false}
          margin={{ top: 8, right: 12, bottom: props.xAxis?.label ? 16 : 0, left: 0 }}
        >
          {(props.showGrid ?? true) && (
            <R.CartesianGrid stroke="var(--glyph-border)" strokeDasharray="3 3" yAxisId="left" />
          )}
          <R.XAxis
            type="number"
            dataKey={x}
            name={props.xAxis?.label ?? String(x)}
            hide={props.xAxis?.hide}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={xFormat}
            domain={(props.xAxis?.domain as [number, number] | undefined) ?? ['auto', 'auto']}
            {...(props.xAxis?.label && {
              label: {
                value: props.xAxis.label,
                position: 'insideBottom',
                offset: -12,
                ...axisTick,
              },
            })}
          />
          <R.YAxis
            yAxisId="left"
            type="number"
            dataKey={y}
            name={props.yAxis?.label ?? String(y)}
            hide={props.yAxis?.hide}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={props.yAxis?.width ?? axisWidth(data, [y], yFormat, props.yAxis?.label ? 18 : 0)}
            tickFormatter={yFormat}
            domain={(props.yAxis?.domain as [number, number] | undefined) ?? ['auto', 'auto']}
            {...(props.yAxis?.label && {
              label: { value: props.yAxis.label, angle: -90, position: 'insideLeft', ...axisTick },
            })}
          />
          {size && (
            <R.ZAxis
              type="number"
              dataKey={size}
              range={(props.sizeRange as [number, number] | undefined) ?? [40, 600]}
            />
          )}
          <R.Tooltip
            cursor={{ stroke: 'var(--glyph-border-strong)', strokeDasharray: '3 3' }}
            isAnimationActive={false}
            content={(p) => content(p as ScatterTooltipProps)}
          />
          {overlays({ ...cartesian, brush: false })}
          {groups.map((group) => (
            <R.Scatter
              key={group.key}
              yAxisId="left"
              name={group.key}
              data={group.rows}
              fill={group.color}
              fillOpacity={size ? 0.65 : 0.9}
              stroke="var(--glyph-surface)"
              strokeWidth={1.5}
              hide={hidden.includes(group.key)}
              {...(props.onPointClick && {
                onClick: (point: { payload?: Row }) => {
                  if (point.payload) props.onPointClick?.(point.payload as T)
                },
                style: { cursor: 'pointer' },
              })}
              {...animation}
            />
          ))}
        </R.ScatterChart>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}
