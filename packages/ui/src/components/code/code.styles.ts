import type { StylesEntry } from '../../utils/registry'
import { themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const codeStyles = tv({
  slots: {
    base: 'rounded-xs bg-muted px-[0.3em] py-[0.15em] font-mono text-[0.875em] text-foreground',
  },
})

export const codeBlockStyles = tv({
  slots: {
    root: ['relative min-w-0 overflow-hidden rounded-lg border-border bg-subtle', themedBorder],
    header:
      'flex min-h-10 items-center justify-between gap-2 border-b border-border py-1 pr-1.5 pl-4',
    title: 'truncate font-mono text-caption text-faint-foreground',
    copy: 'shrink-0',
    floatingCopy: 'absolute top-2 right-2',
    pre: 'overflow-x-auto p-4 font-mono text-small leading-relaxed text-foreground',
  },
  variants: {
    wrap: { true: { pre: 'whitespace-pre-wrap break-words' } },
  },
})

export type CodeBlockVariants = VariantProps<typeof codeBlockStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Code: StylesEntry<typeof codeStyles>
    CodeBlock: StylesEntry<typeof codeBlockStyles>
  }
}
