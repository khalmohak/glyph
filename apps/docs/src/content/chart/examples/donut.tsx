import { Card, Text } from '@glyphui/ui'
import { DonutChart, Sparkline } from '@glyphui/ui/chart'

export default function Example() {
  return (
    <div className="grid w-full items-start gap-4 sm:grid-cols-2">
      <DonutChart
        title="Plan mix"
        data={[
          { plan: 'Free', seats: 1840 },
          { plan: 'Pro', seats: 960 },
          { plan: 'Team', seats: 410 },
        ]}
        category="plan"
        value="seats"
        size={180}
        centerLabel={
          <>
            <span className="font-display text-h3 tabular-nums">3,210</span>
            <span className="text-caption text-muted-foreground">seats</span>
          </>
        }
      />
      <Card padding="sm">
        <Text size="small" tone="muted" className="px-1">
          Weekly active users
        </Text>
        <p className="px-1 font-display text-h2 tabular-nums">12,480</p>
        <Sparkline
          title="Weekly active users over 12 weeks, rising"
          values={[8, 9, 9, 10, 9, 11, 11, 12, 11, 12, 13, 12.5]}
        />
      </Card>
    </div>
  )
}
