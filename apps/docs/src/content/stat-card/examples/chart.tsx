import { StatCard } from '@glyphui/ui'
import { Sparkline } from '@glyphui/ui/chart'

const values = [12, 14, 13, 17, 16, 19, 18, 22, 21, 25, 27, 30]

export default function Example() {
  return (
    <StatCard
      className="max-w-xs"
      label="Monthly recurring revenue"
      value="$30,400"
      delta="8.2%"
      trend="up"
      chart={<Sparkline title="Monthly recurring revenue over 12 months, rising" values={values} />}
    />
  )
}
