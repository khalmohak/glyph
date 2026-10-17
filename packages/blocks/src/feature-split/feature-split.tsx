import { Container, cn, Eyebrow, Heading, Reveal, Section, Stagger, Text } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import type { BlockMotionProps } from '../internal/motion'
import { useBlocksStylesCheck } from '../internal/styles-check'
import { type HeadingLevel, SectionHeader } from '../section-header'

export interface FeatureSplitItem {
  eyebrow?: ReactNode
  title: ReactNode
  description: ReactNode
  /** Short supporting points shown as a list. */
  points?: readonly ReactNode[]
  actions?: ReactNode
  media: ReactNode
}

export interface FeatureSplitProps
  extends Omit<ComponentProps<'section'>, 'title'>,
    BlockMotionProps {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  items: readonly FeatureSplitItem[]
  /** Put media on the left for the first row. Rows alternate after that. */
  mediaFirst?: boolean
  headingLevel?: HeadingLevel
}

/** Feature rows that alternate text and media, for explaining a product in depth. */
export function FeatureSplit({
  eyebrow,
  title,
  description,
  items,
  mediaFirst = false,
  headingLevel = 2,
  animate = true,
  className,
  ...props
}: FeatureSplitProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  const rowLevel = (title ? Math.min(headingLevel + 1, 6) : headingLevel) as HeadingLevel
  return (
    <Section
      data-slot="feature-split"
      aria-labelledby={title ? titleId : undefined}
      className={className}
      {...props}
    >
      <Container className="grid gap-16 sm:gap-24">
        {title && (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            headingLevel={headingLevel}
            titleId={titleId}
            animate={animate}
          />
        )}
        {items.map((item, i) => {
          const mediaLeft = mediaFirst ? i % 2 === 0 : i % 2 === 1
          return (
            <div key={i} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <Stagger enabled={animate} className={cn('grid gap-4', mediaLeft && 'lg:order-2')}>
                {item.eyebrow && <Eyebrow tone="primary">{item.eyebrow}</Eyebrow>}
                <Heading level={rowLevel} size="h3">
                  {item.title}
                </Heading>
                <Text tone="muted">{item.description}</Text>
                {item.points && item.points.length > 0 && (
                  <ul className="grid gap-2 text-body">
                    {item.points.map((point, j) => (
                      <li key={j} className="flex gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-primary"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.actions && <div className="flex flex-wrap gap-3 pt-2">{item.actions}</div>}
              </Stagger>
              <Reveal
                enabled={animate}
                delay={120}
                scale
                className={cn('min-w-0', mediaLeft && 'lg:order-1')}
              >
                {item.media}
              </Reveal>
            </div>
          )
        })}
      </Container>
    </Section>
  )
}
