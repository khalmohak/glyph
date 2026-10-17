import { useId } from 'react'
import * as R from 'recharts'
import { type ChartColorValue, resolveColor, useChartAnimation } from './chart-parts'

export interface SparklineProps {
  values: readonly number[]
  /** Accessible description, e.g. "Revenue over the last 12 months, rising". */
  title: string
  color?: ChartColorValue
  /** Height in pixels. Default 36. */
  height?: number
  /** `area` (default) fills under the line, `line` is just the stroke, `bar` draws columns. */
  variant?: 'area' | 'line' | 'bar'
  /** @deprecated Use `variant="line"` for no fill. */
  area?: boolean
  /** Mark the highest and lowest points. */
  showMinMax?: boolean
  className?: string
}

/** A tiny trend without axes, for stat cards and table cells. */
export function Sparkline({
  values,
  title,
  color,
  height = 36,
  variant,
  area,
  showMinMax = false,
  className,
}: SparklineProps) {
  const id = useId().replace(/:/g, '')
  const animation = useChartAnimation()
  const stroke = resolveColor(color, 0)
  const kind = variant ?? (area === false ? 'line' : 'area')
  const data = values.map((v, i) => ({ i, v }))
  const maxIndex = values.indexOf(Math.max(...values))
  const minIndex = values.indexOf(Math.min(...values))
  const margin = {
    top: showMinMax ? 4 : 2,
    right: showMinMax ? 4 : 2,
    bottom: showMinMax ? 4 : 2,
    left: showMinMax ? 4 : 2,
  }

  const marker = (props: { cx?: number; cy?: number; index?: number }) => {
    const { cx, cy, index } = props
    if (!showMinMax || cx === undefined || cy === undefined) return <g key={index} />
    if (index !== maxIndex && index !== minIndex) return <g key={index} />
    return (
      <circle
        key={index}
        data-extreme={index === maxIndex ? 'max' : 'min'}
        cx={cx}
        cy={cy}
        r={2.75}
        fill={index === maxIndex ? stroke : 'var(--glyph-surface)'}
        stroke={stroke}
        strokeWidth={1.5}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={title}
      data-slot="sparkline"
      data-variant={kind}
      className={className}
      style={{ height }}
    >
      <R.ResponsiveContainer width="100%" height="100%">
        {kind === 'bar' ? (
          <R.BarChart accessibilityLayer={false} data={data} margin={margin} barCategoryGap="18%">
            <R.Bar dataKey="v" radius={[2, 2, 0, 0]} {...animation}>
              {data.map((point) => (
                <R.Cell
                  key={point.i}
                  fill={stroke}
                  fillOpacity={
                    showMinMax && (point.i === maxIndex || point.i === minIndex) ? 1 : 0.55
                  }
                />
              ))}
            </R.Bar>
          </R.BarChart>
        ) : (
          <R.AreaChart accessibilityLayer={false} data={data} margin={margin}>
            <defs>
              <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={kind === 'area' ? 0.25 : 0} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <R.Area
              dataKey="v"
              type="monotone"
              stroke={stroke}
              strokeWidth={1.75}
              fill={`url(#${id})`}
              dot={marker}
              activeDot={false}
              {...animation}
            />
          </R.AreaChart>
        )}
      </R.ResponsiveContainer>
    </div>
  )
}
