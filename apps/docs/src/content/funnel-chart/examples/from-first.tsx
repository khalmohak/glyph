import { FunnelChart } from '@glyphui/ui/chart'

const steps = [
  { step: 'Opened checkout', sessions: 3200 },
  { step: 'Entered card', sessions: 2140 },
  { step: 'Confirmed', sessions: 1890 },
]

export default function Example() {
  return (
    <FunnelChart
      className="w-full"
      title="Checkout completion"
      data={steps}
      category="step"
      value="sessions"
      conversion="first"
      color="chart-2"
    />
  )
}
