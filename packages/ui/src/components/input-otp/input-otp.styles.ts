import type { StylesEntry } from '../../utils/registry'
import { transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const inputOtpStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'flex items-center gap-1.5 has-disabled:opacity-50 sm:gap-2',
    input: 'disabled:cursor-not-allowed',
    group: 'flex items-center',
    slot: [
      'relative flex items-center justify-center border-input bg-surface font-medium tabular-nums text-foreground shadow-xs',
      'border-y-(length:--glyph-border-width) border-r-(length:--glyph-border-width)',
      'first:rounded-l-md first:border-l-(length:--glyph-border-width) last:rounded-r-md',
      'data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-3 data-[active=true]:ring-ring/20',
      'aria-invalid:border-danger',
      transition,
    ],
    caret: 'pointer-events-none absolute inset-0 flex items-center justify-center',
    caretBar: 'h-4 w-px animate-pulse bg-foreground',
    separator: 'flex items-center text-faint-foreground [&>svg]:size-4',
  },
  variants: {
    size: {
      // One step smaller on phones, so eight slots in two groups fit a 390px screen.
      sm: { slot: 'size-8 text-small' },
      md: { slot: 'size-10 text-body max-sm:size-8' },
      lg: { slot: 'size-12 text-h4 max-sm:size-10' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type InputOTPVariants = VariantProps<typeof inputOtpStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    InputOTP: StylesEntry<typeof inputOtpStyles>
  }
}
