import { Cta } from '@glyphui/blocks'
import { Button } from '@glyphui/ui'

export default function Example() {
  return (
    <Cta
      title="Send your next invoice in five minutes"
      description="Connect your payment provider, pick a template, and you’re done."
      actions={
        <>
          <Button size="lg">Start free</Button>
          <Button size="lg" variant="ghost">
            Talk to sales
          </Button>
        </>
      }
    />
  )
}
