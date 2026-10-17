import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

/**
 * Element styles for long-form content. Every value comes from theme tokens, so articles
 * pick up the theme's display font, type scale, colors and radius.
 */
export const proseStyles = tv({
  slots: {
    base: [
      'text-foreground [&>:first-child]:mt-0 [&>:last-child]:mb-0',
      // Headings
      '[&_h1]:mt-[1.4em] [&_h1]:mb-[0.5em] [&_h1]:font-display [&_h1]:text-h1 [&_h1]:text-balance',
      '[&_h2]:mt-[1.6em] [&_h2]:mb-[0.5em] [&_h2]:font-display [&_h2]:text-h2 [&_h2]:text-balance',
      '[&_h3]:mt-[1.5em] [&_h3]:mb-[0.4em] [&_h3]:font-display [&_h3]:text-h3 [&_h3]:text-balance',
      '[&_h4]:mt-[1.4em] [&_h4]:mb-[0.4em] [&_h4]:font-display [&_h4]:text-h4',
      // Text
      '[&_p]:my-[1em] [&_p]:text-pretty',
      '[&_strong]:font-semibold [&_strong]:text-foreground',
      '[&_a]:font-medium [&_a]:text-primary-text [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-4 [&_a:hover]:decoration-primary',
      // Lists
      '[&_ul]:my-[1em] [&_ul]:list-disc [&_ul]:pl-[1.5em] [&_ol]:my-[1em] [&_ol]:list-decimal [&_ol]:pl-[1.5em]',
      '[&_li]:my-[0.35em] [&_li]:pl-[0.25em] [&_li::marker]:text-faint-foreground',
      // Quotes
      '[&_blockquote]:my-[1.5em] [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-[1em] [&_blockquote]:font-display [&_blockquote]:text-muted-foreground',
      // Code
      '[&_:not(pre)>code]:rounded-xs [&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:px-[0.3em] [&_:not(pre)>code]:py-[0.15em] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]',
      '[&_pre]:my-[1.5em] [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-subtle [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-small [&_pre]:leading-relaxed',
      // Media and rules
      '[&_hr]:my-[2em] [&_hr]:border-border',
      '[&_img]:my-[1.5em] [&_img]:max-w-full [&_img]:rounded-lg',
      '[&_figure]:my-[1.75em] [&_figure_img]:my-0 [&_figcaption]:mt-2 [&_figcaption]:text-small [&_figcaption]:text-faint-foreground',
      // Tables
      '[&_table]:my-[1.5em] [&_table]:w-full [&_table]:border-collapse [&_table]:text-small [&_table]:tabular-nums',
      '[&_th]:border-b [&_th]:border-border-strong [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium',
      '[&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
    ],
  },
  variants: {
    size: {
      sm: { base: 'text-small [&_blockquote]:text-body' },
      md: { base: 'text-body [&_blockquote]:text-lead' },
      lg: { base: 'text-lead [&_blockquote]:text-h4' },
    },
    fullWidth: {
      true: { base: 'max-w-none' },
      false: { base: 'max-w-prose' },
    },
  },
  defaultVariants: { size: 'md', fullWidth: false },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Prose: StylesEntry<typeof proseStyles>
  }
}

export interface ProseProps extends ComponentProps<'div'>, VariantProps<typeof proseStyles> {
  /** Render the child element (e.g. `<article>`) instead of a `<div>`. */
  asChild?: boolean
}

/**
 * Styles raw HTML or MDX (headings, lists, links, quotes, code, tables, images) from theme
 * tokens. Wrap rendered Markdown or CMS content in it.
 */
export function Prose(inProps: ProseProps) {
  const [props, slots] = useComponentConfig('Prose', inProps)
  const { size, fullWidth, asChild, className, ...rest } = props
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="prose"
      className={proseStyles({ size, fullWidth }).base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}
