import { Card, CardDescription, CardTitle } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(['outline', 'elevated', 'ghost'] as const).map((variant) => (
        <Card key={variant} variant={variant} padding="sm">
          <CardTitle>{variant}</CardTitle>
          <CardDescription>variant="{variant}"</CardDescription>
        </Card>
      ))}
    </div>
  )
}
