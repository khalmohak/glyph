import { Card, Grid, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={4}>
      {['Projects', 'Issues', 'Members', 'Integrations'].map((label) => (
        <Card key={label} padding="sm">
          <Text size="small" tone="muted">
            {label}
          </Text>
        </Card>
      ))}
    </Grid>
  )
}
