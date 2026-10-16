import { Container, Heading, Section, Text, tv } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import type { HeadingLevel } from '../section-header'

export const heroStyles = tv({
  slots: {
    root: 'relative isolate overflow-hidden',
    glow: 'pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[32rem] bg-[radial-gradient(50%_50%_at_50%_40%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent)]',
    layout: 'grid items-center gap-12',
    text: 'grid gap-6',
    actions: 'flex flex-wrap items-center gap-3',
    media: 'min-w-0',
    footnote: 'text-small text-faint-foreground',
  },
  variants: {
    variant: {
      centered: {
        text: 'mx-auto max-w-3xl justify-items-center text-center',
        actions: 'justify-center',
      },
      left: { text: 'max-w-3xl' },
      split: { layout: 'lg:grid-cols-2' },
    },
  },
  defaultVariants: { variant: 'centered' },
})

export interface HeroProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** `centered` (default), `left`, or `split` with media beside the text on large screens. */
  variant?: 'centered' | 'left' | 'split'
  /** Small label above the title, e.g. a Badge announcing a release. */
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Buttons or links. */
  actions?: ReactNode
  /** Screenshot, illustration or video. Below the text, or beside it with `split`. */
  media?: ReactNode
  /** Small print under the actions, e.g. "No credit card required". */
  footnote?: ReactNode
  /** Soft glow from the primary color behind the hero. Default true. */
  glow?: boolean
  /** Document outline level of the title. Default 1. */
  headingLevel?: HeadingLevel
}

/** The opening section of a page: headline, supporting text, actions and optional media. */
export function Hero({
  variant = 'centered',
  eyebrow,
  title,
  description,
  actions,
  media,
  footnote,
  glow = true,
  headingLevel = 1,
  className,
  ...props
}: HeroProps) {
  const titleId = useId()
  const s = heroStyles({ variant })
  return (
    <Section
      spacing="lg"
      data-slot="hero"
      aria-labelledby={titleId}
      className={s.root({ class: className })}
      {...props}
    >
      {glow && <div aria-hidden="true" className={s.glow()} />}
      <Container className={s.layout()}>
        <div className={s.text()}>
          {eyebrow && <div>{eyebrow}</div>}
          <Heading level={headingLevel} size="display" id={titleId}>
            {title}
          </Heading>
          {description && (
            <Text size="lead" tone="muted" className="max-w-2xl">
              {description}
            </Text>
          )}
          {actions && <div className={s.actions()}>{actions}</div>}
          {footnote && <p className={s.footnote()}>{footnote}</p>}
        </div>
        {media && <div className={s.media()}>{media}</div>}
      </Container>
    </Section>
  )
}
