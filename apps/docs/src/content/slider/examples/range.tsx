import { Slider, Text } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [price, setPrice] = useState<readonly [number, number]>([200, 800])
  return (
    <div className="grid max-w-sm gap-3">
      <Slider<readonly [number, number]>
        value={price}
        onValueChange={setPrice}
        min={0}
        max={1000}
        step={50}
        minStepsBetweenThumbs={1}
        thumbLabels={['Minimum price', 'Maximum price']}
      />
      <Text size="small" tone="muted">
        ${price[0]} – ${price[1]}
      </Text>
    </div>
  )
}
