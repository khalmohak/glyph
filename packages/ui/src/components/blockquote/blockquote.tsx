import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const blockquoteStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid gap-3 border-l-2 border-primary pl-5',
    quote: 'font-display text-pretty text-foreground',
    caption: 'text-small text-muted-foreground',
    author: 'font-medium text-foreground not-italic',
  },
  variants: {
    size: {
      sm: { quote: 'text-body' },
      md: { quote: 'text-lead' },
      lg: { quote: 'text-h3' },
    },
  },
  defaultVariants: { size: 'md' },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Blockquote: StylesEntry<typeof blockquoteStyles>
  }
}

export interface BlockquoteProps
  extends ComponentProps<'figure'>,
    VariantProps<typeof blockquoteStyles> {
  /** Who said it. */
  author?: ReactNode
  /** Their role or the work it's from, shown after the author. */
  source?: ReactNode
  /** URL of the quoted source, set as the `cite` attribute. */
  citeUrl?: string
}

/** A quotation with an optional attribution. */
export function Blockquote(inProps: BlockquoteProps) {
  const [props, slots] = useComponentConfig('Blockquote', inProps)
  const { author, source, citeUrl, size, className, children, ...rest } = props
  const s = blockquoteStyles({ size })
  return (
    <figure data-slot="blockquote" className={s.root({ class: [slots.root, className] })} {...rest}>
      <blockquote cite={citeUrl} className={s.quote({ class: slots.quote })}>
        {children}
      </blockquote>
      {(author || source) && (
        <figcaption className={s.caption({ class: slots.caption })}>
          {author && <cite className={s.author({ class: slots.author })}>{author}</cite>}
          {author && source && ', '}
          {source}
        </figcaption>
      )}
    </figure>
  )
}
