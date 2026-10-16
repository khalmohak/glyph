import { Card, CardDescription, CardTitle } from '@glyphui/ui'

export default function Example() {
  return (
    <Card variant="interactive" asChild className="max-w-sm">
      <a href="#card">
        <CardTitle>Getting started</CardTitle>
        <CardDescription>
          Install Glyph and write your first theme file in five minutes.
        </CardDescription>
      </a>
    </Card>
  )
}
