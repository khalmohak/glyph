import { type ReactNode, useEffect, useState } from 'react'
import { useMotionSettings } from '../../motion/use-motion-settings'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  defaultFormatter,
  type Key,
  resolveColor,
} from './chart-parts'
import { useElementWidth } from './use-element-width'

type Row = Record<string, unknown>

export interface FunnelChartProps<T extends object> extends ChartStateProps {
  /** One row per stage, in order. */
  data: readonly T[]
  /** Field naming each stage, e.g. `"stage"`. */
  category: Key<T>
  /** Field holding how many reached the stage. */
  value: Key<T>
  title: string
  description?: ReactNode
  hideTitle?: boolean
  /** Default `chart-1`. Later stages are lighter tints of it. */
  color?: ChartColorValue
  valueFormatter?: (value: number) => string
  /** Under each value: share of the first stage or of the previous one. Default `previous`. */
  conversion?: 'first' | 'previous' | 'none'
  className?: string
}

const ROW = 44
const GAP = 6

const percent = (value: number) =>
  `${value >= 0.1 ? Math.round(value * 100) : Math.round(value * 1000) / 10}%`

/** How many make it through each step of a flow, e.g. visit → signup → paid. */
export function FunnelChart<T extends object>(props: FunnelChartProps<T>) {
  const {
    data,
    category,
    value,
    valueFormatter = defaultFormatter,
    conversion = 'previous',
  } = props
  const { animate } = useMotionSettings()
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [grown, setGrown] = useState(!animate)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const rows = data.map((row) => ({
    name: String((row as Row)[category]),
    value: Number((row as Row)[value]) || 0,
  }))
  const first = rows[0]?.value || 1
  const base = resolveColor(props.color ?? 'chart-1', 0)
  const labelWidth = Math.min(Math.max(width * 0.26, 88), 180)
  const valueWidth = Math.min(Math.max(width * 0.2, 84), 132)
  const area = Math.max(width - labelWidth - valueWidth - 16, 40)
  const height = rows.length * ROW + Math.max(rows.length - 1, 0) * GAP
  const rate = (i: number) => {
    const reference = conversion === 'first' ? first : (rows[i - 1]?.value ?? first)
    return rows[i]!.value / (reference || 1)
  }
  const table = {
    columns: [
      String(category),
      String(value),
      ...(conversion === 'none' ? [] : [conversion === 'first' ? '% of first' : '% of previous']),
    ],
    rows: rows.map((row, i) => [
      row.name,
      valueFormatter(row.value),
      ...(conversion === 'none' ? [] : [i === 0 ? '100%' : percent(rate(i))]),
    ]),
  }

  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      table={table}
      height={height || 200}
      isEmpty={rows.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <div ref={ref} className="w-full">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          aria-hidden="true"
        >
          {rows.map((row, i) => {
            const y = i * (ROW + GAP)
            const barWidth = Math.max((row.value / first) * area, 2)
            const x = labelWidth + 8 + (area - barWidth) / 2
            const mix = Math.max(100 - i * 14, 40)
            const fill =
              i === 0 ? base : `color-mix(in oklab, ${base} ${mix}%, var(--glyph-surface))`
            return (
              <g key={row.name}>
                <text
                  x={0}
                  y={y + ROW / 2}
                  dominantBaseline="central"
                  fill="var(--glyph-foreground)"
                  fontSize={13}
                >
                  {row.name}
                </text>
                <rect
                  x={x}
                  y={y + 4}
                  width={barWidth}
                  height={ROW - 8}
                  rx={4}
                  fill={fill}
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    transform: grown ? 'scaleX(1)' : 'scaleX(0)',
                    transition: animate
                      ? `transform calc(var(--glyph-duration-slow) * 2) var(--glyph-ease-emphasized) ${i * 60}ms`
                      : undefined,
                  }}
                />
                <text
                  x={width}
                  y={conversion === 'none' || i === 0 ? y + ROW / 2 : y + ROW / 2 - 8}
                  dominantBaseline="central"
                  textAnchor="end"
                  fill="var(--glyph-foreground)"
                  fontSize={13}
                  fontWeight={500}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {valueFormatter(row.value)}
                </text>
                {conversion !== 'none' && i > 0 && (
                  <text
                    x={width}
                    y={y + ROW / 2 + 9}
                    dominantBaseline="central"
                    textAnchor="end"
                    fill="var(--glyph-muted-foreground)"
                    fontSize={11}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {percent(rate(i))} {conversion === 'first' ? 'of total' : 'converted'}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </ChartFrame>
  )
}
