import { FeatureSplit } from '@glyphui/blocks'
import { Button, Card, Text } from '@glyphui/ui'

function Mock({ label }: { label: string }) {
  return (
    <Card variant="ghost" className="aspect-[4/3] items-center justify-center">
      <Text size="small" tone="faint">
        {label}
      </Text>
    </Card>
  )
}

export default function Example() {
  return (
    <FeatureSplit
      items={[
        {
          eyebrow: 'Collect',
          title: 'Usage data in, invoices out',
          description:
            'Send events from your app and Ledgerline meters them against each customer’s plan.',
          points: [
            'Idempotent event API',
            'Backfill from your warehouse',
            'Real-time usage dashboards',
          ],
          media: <Mock label="Usage chart" />,
        },
        {
          eyebrow: 'Recover',
          title: 'Late payments, handled',
          description: 'Dunning emails, card updaters and payment links run on their own.',
          actions: <Button variant="outline">See the dunning flow</Button>,
          media: <Mock label="Dunning timeline" />,
        },
      ]}
    />
  )
}
