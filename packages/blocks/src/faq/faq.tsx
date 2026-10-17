import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Container,
  cn,
  Section,
} from '@glyphui/ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import { useBlocksStylesCheck } from '../internal/styles-check'
import { type HeadingLevel, SectionHeader } from '../section-header'

export interface FaqItem {
  question: ReactNode
  answer: ReactNode
  /** Stable id for the item. Defaults to its position. */
  id?: string
}

export interface FaqProps extends Omit<ComponentProps<'section'>, 'title'> {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  items: readonly FaqItem[]
  /** `stacked` (default) puts the header above; `split` puts it beside the questions on large screens. */
  layout?: 'stacked' | 'split'
  /** Allow several answers open at once. */
  multiple?: boolean
  headingLevel?: HeadingLevel
}

/** Frequently asked questions as an accordion. */
export function Faq({
  eyebrow,
  title,
  description,
  items,
  layout = 'stacked',
  multiple = false,
  headingLevel = 2,
  className,
  ...props
}: FaqProps) {
  useBlocksStylesCheck()
  const titleId = useId()
  const list = (
    <Accordion
      {...(multiple
        ? { type: 'multiple' as const }
        : { type: 'single' as const, collapsible: true })}
      className="w-full min-w-0"
    >
      {items.map((item, i) => (
        <AccordionItem key={item.id ?? i} value={item.id ?? String(i)}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
  return (
    <Section
      data-slot="faq"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : 'Frequently asked questions'}
      className={className}
      {...props}
    >
      <Container
        size={layout === 'split' ? 'xl' : 'md'}
        className={cn('grid gap-10', layout === 'split' && 'lg:grid-cols-[2fr_3fr] lg:gap-16')}
      >
        {title && (
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            align={layout === 'split' ? 'left' : 'center'}
            headingLevel={headingLevel}
            titleId={titleId}
            className={layout === 'split' ? 'h-fit lg:sticky lg:top-24' : undefined}
          />
        )}
        {list}
      </Container>
    </Section>
  )
}
