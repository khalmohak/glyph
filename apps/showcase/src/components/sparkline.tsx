import { cn } from '@glyphkit/ui'
import { useId } from 'react'

/** Small trend line with an area fill. Colored by `currentColor`. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const id = useId()
  const w = 120
  const h = 36
  const min = Math.min(...values)
  const max = Math.max(...values)
  const x = (i: number) => (i / (values.length - 1)) * w
  const y = (v: number) => h - 2 - ((v - min) / (max - min || 1)) * (h - 4)
  const line = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ')
  const last = values.at(-1) ?? 0
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn('h-9 w-full overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${h} L0,${h} Z`} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
      <circle cx={w} cy={y(last)} r="2.5" fill="currentColor" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
