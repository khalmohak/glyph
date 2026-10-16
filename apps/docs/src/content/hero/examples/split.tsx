import { Hero } from '@glyphui/blocks'
import { Button, Card, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Hero
      variant="split"
      title="Every on-call shift, calmer"
      description="Pagerline groups related alerts, drafts the incident timeline, and hands off cleanly at the end of the shift."
      actions={<Button size="lg">Try it with your alerts</Button>}
      media={
        <Card className="gap-3">
          <Text size="small" tone="muted">
            Incident #4182 · API latency
          </Text>
          <Text weight="medium">3 alerts grouped · p95 back under 200 ms at 09:41</Text>
          <div className="h-24 rounded-md bg-muted" />
        </Card>
      }
    />
  )
}
