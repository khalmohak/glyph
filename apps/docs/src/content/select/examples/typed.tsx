import { Select, SelectItem, Text } from '@glyphui/ui'
import { useState } from 'react'

type Plan = 'free' | 'pro' | 'team'

export default function Example() {
  const [plan, setPlan] = useState<Plan>('pro')
  return (
    <div className="grid max-w-xs gap-2">
      <Select<Plan> value={plan} onValueChange={setPlan} aria-label="Plan">
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
        <SelectItem value="team">Team</SelectItem>
      </Select>
      <Text size="small" tone="muted">
        Selected: <span className="font-mono">{plan}</span>
      </Text>
    </div>
  )
}
