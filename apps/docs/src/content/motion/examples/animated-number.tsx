import { AnimatedNumber, Button, Card, Text } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [mrr, setMrr] = useState(48210)
  return (
    <Card className="w-full max-w-sm gap-3">
      <Text size="small" tone="muted">
        Monthly recurring revenue
      </Text>
      <p className="font-display text-h1">
        <AnimatedNumber
          value={mrr}
          locale="en-US"
          format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        />
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setMrr((n) => n + 1840)}>
          New customer
        </Button>
        <Button size="sm" variant="outline" onClick={() => setMrr((n) => Math.max(0, n - 920))}>
          Churn
        </Button>
      </div>
    </Card>
  )
}
