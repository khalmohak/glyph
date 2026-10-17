import { Button } from '@glyphui/ui'
import { Gauge } from '@glyphui/ui/chart'
import { useState } from 'react'

export default function Example() {
  const [used, setUsed] = useState(7.4)
  return (
    <div className="grid justify-items-center gap-3">
      <Gauge
        title="Storage"
        value={used}
        max={10}
        valueFormatter={(v) => `${v.toFixed(1)} GB`}
        label="of 10 GB used"
        size={200}
      />
      <Button variant="outline" size="sm" onClick={() => setUsed((v) => (v > 9 ? 2.1 : v + 0.8))}>
        Upload files
      </Button>
    </div>
  )
}
