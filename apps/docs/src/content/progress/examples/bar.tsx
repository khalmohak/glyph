import { Button, Progress } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [value, setValue] = useState(3)
  return (
    <div className="grid max-w-md gap-4">
      <Progress
        label="Uploading files"
        value={value}
        max={5}
        showValue
        formatValue={(v, max) => `${v} of ${max}`}
      />
      <Button
        size="sm"
        variant="outline"
        className="w-fit"
        onClick={() => setValue((v) => (v >= 5 ? 0 : v + 1))}
      >
        Advance
      </Button>
    </div>
  )
}
