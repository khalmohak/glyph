import { Hero } from '@glyphui/blocks'
import { Badge, Button } from '@glyphui/ui'
import { ArrowRight } from 'lucide-react'

export default function Example() {
  return (
    <Hero
      eyebrow={
        <Badge tone="primary" dot>
          New · Usage-based billing
        </Badge>
      }
      title="Invoices that send themselves"
      description="Ledgerline turns usage data into accurate invoices, chases late payments, and syncs everything to your books."
      actions={
        <>
          <Button size="lg" rightIcon={<ArrowRight />}>
            Start free trial
          </Button>
          <Button size="lg" variant="outline">
            Book a demo
          </Button>
        </>
      }
      footnote="14-day trial. No credit card required."
    />
  )
}
