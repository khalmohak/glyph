import { Container, cn, Section, Stagger } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import { type BlockMotionProps, CountUp } from '../internal/motion'
import { useBlocksStylesCheck } from '../internal/styles-check'
import { type HeadingLevel, SectionHeader } from '../section-header'

export interface StatItem {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
}

export interface StatsProps extends Omit<ComponentProps<'section'>, 'title'>, BlockMotionProps {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  items: readonly StatItem[]
  /** `plain` (default) separates numbers with rules; `cards` puts each on a surface. */
  variant?: 'plain' | 'cards'
  align?: 'left' | 'center'
  headingLevel?: HeadingLevel
}

/** Headline numbers that back up a claim: customers, uptime, time saved. */
export function Stats({
  eyebrow,
  title,
  description,
  items,
  variant = 'plain',
  align = 'left',
  headingLevel = 2,
  animate = true,
  className,
  ...props
}: StatsProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  return (
    <Section
      data-slot="stats"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : 'Key numbers'}
      className={className}
      {...props}
    >
      <Container className="grid gap-10">
        {title && (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            align={align}
            headingLevel={headingLevel}
            titleId={titleId}
            animate={animate}
          />
        )}
        <Stagger
          as="dl"
          enabled={animate}
          className={cn(
            'grid gap-6 sm:grid-cols-2',
            items.length >= 4 ? 'lg:grid-cols-4' : items.length === 3 ? 'lg:grid-cols-3' : '',
          )}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex min-w-0 flex-col-reverse gap-1',
                align === 'center' && 'items-center text-center',
                variant === 'cards'
                  ? 'rounded-lg border-(length:--glyph-border-width) border-border bg-surface p-6 shadow-sm'
                  : 'border-l-(length:--glyph-border-width) border-border pl-5',
              )}
            >
              <dt className="text-small text-muted-foreground">
                {item.label}
                {item.description && (
                  <span className="mt-1 block text-faint-foreground">{item.description}</span>
                )}
              </dt>
              <dd className="font-display text-h1 tabular-nums text-foreground">
                <CountUp value={item.value} animate={animate} />
              </dd>
            </div>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}
