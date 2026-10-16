import { Button, Stepper, Text } from '@glyphui/ui'
import { useState } from 'react'

const steps = [
  { title: 'Account' },
  { title: 'Workspace' },
  { title: 'Invite team' },
  { title: 'Done' },
]

export default function Example() {
  const [current, setCurrent] = useState(1)
  return (
    <div className="grid w-full max-w-xl gap-6">
      <Stepper steps={steps} current={current} onStepClick={setCurrent} aria-label="Onboarding" />
      <div className="flex items-center justify-between gap-3">
        <Text size="small" tone="muted">
          Step {current + 1} of {steps.length}
        </Text>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
          >
            Back
          </Button>
          <Button
            size="sm"
            disabled={current === steps.length - 1}
            onClick={() => setCurrent((c) => c + 1)}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
