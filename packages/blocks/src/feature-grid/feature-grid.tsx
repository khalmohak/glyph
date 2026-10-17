import { Card, Container, Section, Stagger, Text, tv, useLinkComponent } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import type { BlockMotionProps } from '../internal/motion'
import { useBlocksStylesCheck } from '../internal/styles-check'
import { type HeadingLevel, SectionHeader } from '../section-header'

export const featureGridStyles = /* @__PURE__ */ tv({
  slots: {
    grid: 'grid gap-4 sm:grid-cols-2',
    icon: 'flex size-10 items-center justify-center rounded-md border-(length:--glyph-border-width) border-border bg-subtle text-primary [&>svg]:size-5',
    title: 'font-display text-h4 text-foreground',
  },
  variants: {
    columns: {
      2: { grid: '' },
      3: { grid: 'lg:grid-cols-3' },
      4: { grid: 'lg:grid-cols-4' },
    },
  },
  defaultVariants: { columns: 3 },
})

export interface Feature {
  icon?: ReactNode
  title: ReactNode
  description: ReactNode
  /** Makes the whole card a link. */
  href?: string
}

export interface FeatureGridProps
  extends Omit<ComponentProps<'section'>, 'title'>,
    BlockMotionProps {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  features: readonly Feature[]
  columns?: 2 | 3 | 4
  /** `cards` (default) puts each feature on a card; `plain` lists them without surfaces. */
  variant?: 'cards' | 'plain'
  align?: 'left' | 'center'
  headingLevel?: HeadingLevel
}

/** A grid of features or benefits, each with an icon, title and short description. */
export function FeatureGrid({
  eyebrow,
  title,
  description,
  features,
  columns = 3,
  variant = 'cards',
  align = 'left',
  headingLevel = 2,
  animate = true,
  className,
  ...props
}: FeatureGridProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  const Link = useLinkComponent()
  const s = featureGridStyles({ columns })
  const itemLevel = Math.min(headingLevel + 1, 6) as HeadingLevel
  const ItemHeading = `h${title ? itemLevel : headingLevel}` as const

  return (
    <Section
      data-slot="feature-grid"
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
            align={align}
            headingLevel={headingLevel}
            titleId={titleId}
            animate={animate}
          />
        )}
        <Stagger as="ul" className={s.grid()} enabled={animate}>
          {features.map((feature, i) => {
            const body = (
              <>
                {feature.icon && (
                  <span className={s.icon()} aria-hidden="true">
                    {feature.icon}
                  </span>
                )}
                <ItemHeading className={s.title()}>{feature.title}</ItemHeading>
                <Text size="small" tone="muted">
                  {feature.description}
                </Text>
              </>
            )
            return (
              <li key={i} className="min-w-0">
                {variant === 'plain' ? (
                  <div className="grid gap-3">{body}</div>
                ) : feature.href ? (
                  <Card variant="interactive" className="h-full" asChild>
                    <Link href={feature.href}>{body}</Link>
                  </Card>
                ) : (
                  <Card variant="outline" className="h-full">
                    {body}
                  </Card>
                )}
              </li>
            )
          })}
        </Stagger>
      </Container>
    </Section>
  )
}
