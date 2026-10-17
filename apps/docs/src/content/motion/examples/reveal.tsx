import { Button, Card, Reveal, Stagger, Text } from '@glyphui/ui'
import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

const features = ['Automatic retries', 'Revenue reports', 'Audit logs', 'Usage billing']

export default function Example() {
  const [run, setRun] = useState(0)
  return (
    <div className="grid w-full gap-6">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<RotateCcw />}
        className="justify-self-start"
        onClick={() => setRun((n) => n + 1)}
      >
        Replay
      </Button>
      <div key={run} className="grid gap-6">
        <Reveal className="grid gap-1">
          <p className="font-display text-h3">Billing that keeps up</p>
          <Text tone="muted">Reveal fades and lifts a block in when it scrolls into view.</Text>
        </Reveal>
        <Stagger as="ul" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <li key={feature}>
              <Card padding="sm" className="h-full">
                <Text weight="medium">{feature}</Text>
              </Card>
            </li>
          ))}
        </Stagger>
      </div>
    </div>
  )
}
