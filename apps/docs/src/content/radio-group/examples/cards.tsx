import { RadioGroup, RadioGroupItem } from '@glyphui/ui'
import { useState } from 'react'

type Plan = 'free' | 'pro' | 'team'

export default function Example() {
  const [plan, setPlan] = useState<Plan>('pro')
  return (
    <RadioGroup<Plan>
      aria-label="Plan"
      variant="card"
      orientation="horizontal"
      value={plan}
      onValueChange={setPlan}
    >
      <RadioGroupItem value="free" label="Free" description="3 projects, community support" />
      <RadioGroupItem
        value="pro"
        label="Pro · $16"
        description="Unlimited projects, priority support"
      />
      <RadioGroupItem value="team" label="Team · $28" description="SSO, audit log, shared themes" />
    </RadioGroup>
  )
}
