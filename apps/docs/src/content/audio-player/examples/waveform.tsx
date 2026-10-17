import { Waveform } from '@glyphui/viewers/media'
import { useState } from 'react'

const peaks = Array.from(
  { length: 80 },
  (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i / 6)) * (1 - i / 120),
)

export default function Example() {
  const [time, setTime] = useState(12)
  return (
    <div className="grid w-full max-w-lg gap-2 text-primary">
      <Waveform
        peaks={peaks}
        currentTime={time}
        duration={40}
        onSeek={setTime}
        label="Call recording position"
      />
      <span className="text-caption text-muted-foreground tabular-nums">
        {Math.round(time)}s of 40s
      </span>
    </div>
  )
}
