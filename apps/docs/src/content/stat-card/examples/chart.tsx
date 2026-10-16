import { StatCard } from '@glyphui/ui'

const values = [12, 14, 13, 17, 16, 19, 18, 22, 21, 25, 27, 30]

function Sparkline() {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 120},${34 - ((v - min) / (max - min)) * 30}`)
    .join(' ')
  return (
    <svg viewBox="0 0 120 36" className="h-9 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function Example() {
  return (
    <StatCard
      className="max-w-xs"
      label="Monthly recurring revenue"
      value="$30,400"
      delta="8.2%"
      trend="up"
      chart={<Sparkline />}
    />
  )
}
