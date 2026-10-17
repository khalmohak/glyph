import { cn, Eyebrow, Heading, Text } from '@glyphui/ui'
import type { ReactNode } from 'react'
import { useBlocksStylesCheck } from '../internal/styles-check'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface SectionHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  /** Document outline level of the title. Default 2. */
  headingLevel?: HeadingLevel
  /** Id for the title, so the section can reference it with aria-labelledby. */
  titleId?: string
  className?: string
}

/** Eyebrow, title and description at the top of a section. Used by most blocks. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  headingLevel = 2,
  titleId,
  className,
}: SectionHeaderProps) {
  useBlocksStylesCheck()
  return (
    <div
      data-slot="section-header"
      className={cn(
        'grid max-w-2xl gap-3',
        align === 'center' && 'mx-auto justify-items-center text-center',
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading level={headingLevel} size="h2" id={titleId}>
        {title}
      </Heading>
      {description && (
        <Text size="lead" tone="muted">
          {description}
        </Text>
      )}
    </div>
  )
}
