import { Button } from '@glyphui/ui'
import { LineChart } from '@glyphui/ui/chart'
import { useEffect, useState } from 'react'

const start = [42, 45, 44, 48, 51, 49, 53, 56, 55, 58, 61, 59]

function next(points: { t: number; rps: number }[]) {
  const last = points[points.length - 1]!
  const drift = Math.sin(last.t / 2) * 3
  return [...points.slice(1), { t: last.t + 1, rps: Math.max(20, Math.round(last.rps + drift)) }]
}

export default function Example() {
  const [running, setRunning] = useState(false)
  const [points, setPoints] = useState(() => start.map((rps, t) => ({ t, rps })))

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setPoints(next), 1200)
    return () => clearInterval(timer)
  }, [running])

  return (
    <div className="grid w-full gap-3">
      <Button
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={() => setRunning((r) => !r)}
      >
        {running ? 'Pause stream' : 'Start stream'}
      </Button>
      <LineChart
        title="Requests per second"
        data={points.map((p) => ({ ...p, label: `${p.t}s` }))}
        index="label"
        height={200}
        series={[{ key: 'rps', label: 'Requests/s' }]}
        yAxis={{ domain: [0, 'auto'] }}
      />
    </div>
  )
}
