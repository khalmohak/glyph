import { Avatar, Card, Container, cn, Reveal, Section, Stagger } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import type { BlockMotionProps } from '../internal/motion'
import { useBlocksStylesCheck } from '../internal/styles-check'
import { type HeadingLevel, SectionHeader } from '../section-header'

export interface Testimonial {
  quote: ReactNode
  author: {
    name: string
    /** Role and company, e.g. "Head of Design, Acme". */
    title?: ReactNode
    avatar?: string
  }
}

export interface TestimonialsProps
  extends Omit<ComponentProps<'section'>, 'title'>,
    BlockMotionProps {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  items: readonly Testimonial[]
  /** `grid` (default) shows cards in columns; `featured` shows the first quote large. */
  variant?: 'grid' | 'featured'
  headingLevel?: HeadingLevel
}

function Quote({ item, large }: { item: Testimonial; large?: boolean }) {
  return (
    <figure className="flex h-full flex-col gap-5">
      <blockquote className={cn('text-foreground', large ? 'font-display text-h3' : 'text-body')}>
        {item.quote}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <Avatar name={item.author.name} src={item.author.avatar} size={large ? 'lg' : 'md'} />
        <span className="grid">
          <span className="text-small font-medium text-foreground">{item.author.name}</span>
          {item.author.title && (
            <span className="text-small text-muted-foreground">{item.author.title}</span>
          )}
        </span>
      </figcaption>
    </figure>
  )
}

/** Customer quotes with names and roles, as a grid or one featured quote. */
export function Testimonials({
  eyebrow,
  title,
  description,
  items,
  variant = 'grid',
  headingLevel = 2,
  animate = true,
  className,
  ...props
}: TestimonialsProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  const [first, ...rest] = items
  return (
    <Section
      data-slot="testimonials"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : 'Testimonials'}
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
            animate={animate}
          />
        )}
        {variant === 'featured' && first ? (
          <div className="grid gap-6">
            <Reveal asChild enabled={animate} scale>
              <Card padding="lg" className="mx-auto w-full max-w-3xl">
                <Quote item={first} large />
              </Card>
            </Reveal>
            {rest.length > 0 && (
              <Stagger
                as="ul"
                enabled={animate}
                delay={120}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {rest.map((item, i) => (
                  <li key={i}>
                    <Card variant="outline" className="h-full">
                      <Quote item={item} />
                    </Card>
                  </li>
                ))}
              </Stagger>
            )}
          </div>
        ) : (
          <Stagger as="ul" enabled={animate} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <li key={i}>
                <Card variant="outline" className="h-full">
                  <Quote item={item} />
                </Card>
              </li>
            ))}
          </Stagger>
        )}
      </Container>
    </Section>
  )
}
