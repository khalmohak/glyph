import { StatCard } from '@glyphui/ui'
import { DollarSign, Timer, Users } from 'lucide-react'

export default function Example() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Revenue"
        value="$48,210"
        delta="12.4%"
        trend="up"
        icon={<DollarSign />}
        description="vs. last month"
      />
      <StatCard label="Active users" value="3,912" delta="4.1%" trend="up" icon={<Users />} />
      <StatCard
        label="p95 latency"
        value="182 ms"
        delta="9%"
        trend="down"
        invertTrend
        icon={<Timer />}
      />
    </div>
  )
}
