import { Container, Heading, Section, Text, tv } from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import { useBlocksStylesCheck } from '../internal/styles-check'
import type { HeadingLevel } from '../section-header'

export const ctaStyles = tv({
  slots: {
    panel: 'relative isolate grid justify-items-center gap-5 overflow-hidden text-center',
    glow: 'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_16%,transparent),transparent)]',
    actions: 'flex flex-wrap items-center justify-center gap-3 pt-1',
  },
  variants: {
    variant: {
      band: { panel: 'py-4' },
      card: {
        panel:
          'rounded-xl border-(length:--glyph-border-width) border-border bg-surface px-6 py-12 shadow-md sm:px-12 sm:py-16',
      },
    },
  },
  defaultVariants: { variant: 'card' },
})

export interface CtaProps extends Omit<ComponentProps<'section'>, 'title'> {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** `card` (default) is a raised panel; `band` is open text across the page. */
  variant?: 'band' | 'card'
  headingLevel?: HeadingLevel
}

/** The closing call to action near the end of a page. */
export function Cta({
  title,
  description,
  actions,
  variant = 'card',
  headingLevel = 2,
  className,
  ...props
}: CtaProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  const s = ctaStyles({ variant })
  return (
    <Section data-slot="cta" aria-labelledby={titleId} className={className} {...props}>
      <Container size="lg">
        <div className={s.panel()}>
          <div aria-hidden="true" className={s.glow()} />
          <Heading level={headingLevel} size="h2" id={titleId} className="max-w-2xl">
            {title}
          </Heading>
          {description && (
            <Text size="lead" tone="muted" className="max-w-xl">
              {description}
            </Text>
          )}
          {actions && <div className={s.actions()}>{actions}</div>}
        </div>
      </Container>
    </Section>
  )
}
