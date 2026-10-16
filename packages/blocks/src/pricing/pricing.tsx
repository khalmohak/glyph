import {
  Badge,
  Button,
  Card,
  Container,
  cn,
  Section,
  SegmentedControl,
  Text,
  useLinkComponent,
} from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId, useState } from 'react'
import { type HeadingLevel, SectionHeader } from '../section-header'

export type Billing = 'monthly' | 'yearly'
type Amount = number | string

export interface PricingTier {
  name: string
  description?: ReactNode
  /** A fixed amount, text such as "Custom", or one amount per billing period. */
  price: Amount | { monthly: Amount; yearly: Amount }
  features: readonly ReactNode[]
  cta: { label: ReactNode; href?: string; onClick?: () => void }
  /** Emphasize this tier with a ring and a primary button. */
  highlighted?: boolean
  /** Label on the tier, e.g. "Most popular". */
  badge?: ReactNode
}

export interface PricingProps extends Omit<ComponentProps<'section'>, 'title'> {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  tiers: readonly PricingTier[]
  defaultBilling?: Billing
  /** Labels for the billing switch. */
  billingLabels?: Record<Billing, ReactNode>
  /** Shown after each numeric price, per billing period. */
  periodLabels?: Record<Billing, ReactNode>
  /** Turns numeric prices into text. Default: `$` + the number. */
  formatPrice?: (amount: number) => string
  headingLevel?: HeadingLevel
}

const defaultBillingLabels: Record<Billing, ReactNode> = { monthly: 'Monthly', yearly: 'Yearly' }
const defaultPeriodLabels: Record<Billing, ReactNode> = {
  monthly: 'per month',
  yearly: 'per month, billed yearly',
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-primary"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** Plan comparison with an optional monthly / yearly switch. */
export function Pricing({
  eyebrow,
  title,
  description,
  tiers,
  defaultBilling = 'monthly',
  billingLabels = defaultBillingLabels,
  periodLabels = defaultPeriodLabels,
  formatPrice = (amount) => `$${amount}`,
  headingLevel = 2,
  className,
  ...props
}: PricingProps) {
  const titleId = useId()
  const [billing, setBilling] = useState<Billing>(defaultBilling)
  const Link = useLinkComponent()
  const hasPeriods = tiers.some((tier) => typeof tier.price === 'object')
  const tierLevel = (title ? Math.min(headingLevel + 1, 6) : headingLevel) as HeadingLevel
  const TierHeading = `h${tierLevel}` as const

  return (
    <Section
      data-slot="pricing"
      aria-labelledby={title ? titleId : undefined}
      className={className}
      {...props}
    >
      <Container className="grid gap-10">
        {title && (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            align="center"
            headingLevel={headingLevel}
            titleId={titleId}
          />
        )}
        {hasPeriods && (
          <SegmentedControl<Billing>
            aria-label="Billing period"
            className="mx-auto"
            value={billing}
            onValueChange={setBilling}
            options={[
              { value: 'monthly', label: billingLabels.monthly },
              { value: 'yearly', label: billingLabels.yearly },
            ]}
          />
        )}
        <ul
          className={cn(
            'grid items-stretch gap-4',
            tiers.length === 2 && 'mx-auto w-full max-w-4xl md:grid-cols-2',
            tiers.length === 3 && 'md:grid-cols-3',
            tiers.length >= 4 && 'md:grid-cols-2 xl:grid-cols-4',
          )}
        >
          {tiers.map((tier) => {
            const amount = typeof tier.price === 'object' ? tier.price[billing] : tier.price
            const numeric = typeof amount === 'number'
            const tierId = `${titleId}-${tier.name.replace(/\s+/g, '-').toLowerCase()}`
            return (
              <li key={tier.name} className="min-w-0">
                <Card
                  aria-labelledby={tierId}
                  data-highlighted={tier.highlighted || undefined}
                  className={cn('h-full', tier.highlighted && 'ring-2 ring-primary')}
                >
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <TierHeading id={tierId} className="font-display text-h4">
                        {tier.name}
                      </TierHeading>
                      {tier.badge && <Badge tone="primary">{tier.badge}</Badge>}
                    </div>
                    {tier.description && (
                      <Text size="small" tone="muted">
                        {tier.description}
                      </Text>
                    )}
                  </div>
                  <p className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="font-display text-h1 tabular-nums">
                      {numeric ? formatPrice(amount) : amount}
                    </span>
                    {numeric && (
                      <span className="text-small text-muted-foreground">
                        {periodLabels[billing]}
                      </span>
                    )}
                  </p>
                  <ul className="grid gap-2.5 text-small">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex gap-2">
                        <CheckIcon />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-2">
                    {tier.cta.href ? (
                      <Button fullWidth variant={tier.highlighted ? 'primary' : 'outline'} asChild>
                        <Link href={tier.cta.href}>{tier.cta.label}</Link>
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant={tier.highlighted ? 'primary' : 'outline'}
                        onClick={tier.cta.onClick}
                      >
                        {tier.cta.label}
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      </Container>
    </Section>
  )
}
