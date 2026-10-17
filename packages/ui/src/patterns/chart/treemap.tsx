import type { ReactNode } from 'react'
import * as R from 'recharts'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  ChartTooltipCard,
  categoryColor,
  defaultFormatter,
  type Key,
  useChartAnimation,
} from './chart-parts'

type Row = Record<string, unknown>

export interface TreemapProps<T extends object> extends ChartStateProps {
  /** One row per rectangle. Rows sharing a `group` are colored and nested together. */
  data: readonly T[]
  /** Field naming each rectangle. */
  category: Key<T>
  /** Field holding each rectangle's size. */
  value: Key<T>
  /** Field grouping rectangles, e.g. a team or product line. Each group gets one color. */
  group?: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  colors?: readonly ChartColorValue[]
  valueFormatter?: (value: number) => string
  /** Plot height in pixels. Default 280. */
  height?: number
  showLegend?: boolean
  className?: string
}

interface TileNode {
  name: string
  size?: number
  fill: string
  children?: TileNode[]
  [field: string]: unknown
}

interface TileProps {
  x?: number
  y?: number
  width?: number
  height?: number
  depth?: number
  name?: string
  value?: number
  fill?: string
  children?: unknown
  formatter: (value: number) => string
}

function Tile({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  depth = 0,
  name,
  value,
  fill,
  children,
  formatter,
}: TileProps) {
  // Groups are drawn by their children; only leaves are painted.
  if (Array.isArray(children) && children.length > 0) return null
  if (depth === 0) return null
  const roomForName = width > 56 && height > 28
  const roomForValue = width > 56 && height > 46
  return (
    <g>
      <rect
        x={x + 1}
        y={y + 1}
        width={Math.max(width - 2, 0)}
        height={Math.max(height - 2, 0)}
        rx={4}
        fill={fill}
        stroke="var(--glyph-surface)"
        strokeWidth={2}
      />
      {roomForName && (
        <text
          x={x + 10}
          y={y + 20}
          fill="var(--glyph-surface)"
          fontSize={12}
          fontWeight={500}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
      {roomForValue && value !== undefined && (
        <text
          x={x + 10}
          y={y + 37}
          fill="var(--glyph-surface)"
          fillOpacity={0.85}
          fontSize={11}
          style={{ pointerEvents: 'none', fontVariantNumeric: 'tabular-nums' }}
        >
          {formatter(value)}
        </text>
      )}
    </g>
  )
}

/** Sizes of many parts of a whole, nested by group, e.g. spend by team and vendor. */
export function Treemap<T extends object>(props: TreemapProps<T>) {
  const { data, category, value, group, valueFormatter = defaultFormatter, height = 280 } = props
  const animation = useChartAnimation()
  const rows = data as readonly Row[]
  const groupNames: string[] = []
  if (group) {
    for (const row of rows) {
      const name = String(row[group])
      if (!groupNames.includes(name)) groupNames.push(name)
    }
  }
  const tree: TileNode[] = group
    ? groupNames.map((name, i) => {
        const fill = categoryColor(props.colors?.[i], i)
        return {
          name,
          fill,
          children: rows
            .filter((row) => String(row[group]) === name)
            .map((row) => ({ name: String(row[category]), size: Number(row[value]) || 0, fill })),
        }
      })
    : rows.map((row, i) => ({
        name: String(row[category]),
        size: Number(row[value]) || 0,
        fill: categoryColor(props.colors?.[i], i),
      }))
  const table = {
    columns: [String(category), ...(group ? [String(group)] : []), String(value)],
    rows: rows.map((row) => [
      String(row[category]),
      ...(group ? [String(row[group])] : []),
      valueFormatter(Number(row[value])),
    ]),
  }
  const legend =
    group && (props.showLegend ?? true)
      ? groupNames.map((name, i) => ({ key: name, label: name, color: tree[i]!.fill }))
      : undefined
  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      legend={legend}
      table={table}
      height={height}
      isEmpty={rows.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <R.ResponsiveContainer width="100%" height={height}>
        <R.Treemap
          data={tree}
          dataKey="size"
          nameKey="name"
          aspectRatio={4 / 3}
          content={<Tile formatter={valueFormatter} />}
          {...animation}
        >
          <R.Tooltip
            isAnimationActive={false}
            content={(p) => (
              <ChartTooltipCard
                active={p.active}
                payload={(p.payload as never[] | undefined)?.map(
                  (item: { payload?: Row; value?: unknown }) => ({
                    name: String(item.payload?.name ?? ''),
                    value: item.value,
                    color: String(item.payload?.fill ?? ''),
                  }),
                )}
                formatter={valueFormatter}
              />
            )}
          />
        </R.Treemap>
      </R.ResponsiveContainer>
    </ChartFrame>
  )
}
