import type { StylesEntry } from '../../utils/registry'
import { focusRing } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const passwordInputStyles = tv({
  slots: {
    root: 'grid gap-1.5',
    toggle: [
      '-mr-1 inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-faint-foreground hover:bg-muted hover:text-foreground [&>svg]:size-4',
      focusRing,
    ],
    meter: 'flex items-center gap-2',
    bars: 'grid flex-1 grid-cols-3 gap-1',
    bar: 'h-1 rounded-pill bg-muted transition-colors duration-(--glyph-duration-base)',
    label: 'w-14 text-right text-caption text-muted-foreground',
  },
  variants: {
    strength: {
      weak: { label: 'text-danger-text' },
      fair: { label: 'text-warning-text' },
      strong: { label: 'text-success-text' },
    },
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    PasswordInput: StylesEntry<typeof passwordInputStyles>
  }
}
