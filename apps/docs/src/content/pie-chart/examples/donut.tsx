import { DonutChart } from '@glyphui/ui/chart'

const plans = [
  { plan: 'Free', seats: 1840 },
  { plan: 'Pro', seats: 960 },
  { plan: 'Team', seats: 410 },
  { plan: 'Enterprise', seats: 230 },
]

export default function Example() {
  return (
    <DonutChart
      title="Seats by plan"
      data={plans}
      category="plan"
      value="seats"
      size={200}
      centerLabel={
        <>
          <span className="font-display text-h3 tabular-nums">3,440</span>
          <span className="text-caption text-muted-foreground">seats</span>
        </>
      }
    />
  )
}
