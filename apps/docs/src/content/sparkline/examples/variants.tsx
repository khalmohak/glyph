import { Card, Text } from '@glyphui/ui'
import { Sparkline } from '@glyphui/ui/chart'

const signups = [8, 9, 9, 10, 9, 11, 11, 12, 11, 12, 13, 12.5]
const churn = [4.1, 3.8, 4.4, 3.2, 3.6, 2.9, 3.1, 2.7, 3.4, 2.5, 2.8, 2.4]
const deploys = [12, 18, 9, 22, 17, 25, 14, 19, 23, 16, 21, 28]

export default function Example() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {[
        {
          label: 'Weekly signups',
          value: '12,480',
          chart: <Sparkline title="Signups over 12 weeks, rising" values={signups} />,
        },
        {
          label: 'Churn',
          value: '2.4%',
          chart: (
            <Sparkline
              title="Churn over 12 months, falling, low of 2.4%"
              values={churn}
              variant="line"
              showMinMax
              color="chart-2"
            />
          ),
        },
        {
          label: 'Deploys',
          value: '28',
          chart: (
            <Sparkline
              title="Deploys per week, highest this week"
              values={deploys}
              variant="bar"
              showMinMax
              color="chart-3"
            />
          ),
        },
      ].map((item) => (
        <Card key={item.label} padding="sm" className="gap-1">
          <Text size="small" tone="muted">
            {item.label}
          </Text>
          <p className="font-display text-h3 tabular-nums">{item.value}</p>
          {item.chart}
        </Card>
      ))}
    </div>
  )
}
