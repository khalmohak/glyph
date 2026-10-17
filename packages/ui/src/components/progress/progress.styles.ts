import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const progressStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid w-full gap-1.5',
    header: 'flex items-baseline justify-between gap-3 text-small',
    label: 'font-medium text-foreground',
    value: 'tabular-nums text-muted-foreground',
    track: 'relative w-full overflow-hidden rounded-pill bg-muted',
    indicator: [
      'h-full w-full rounded-pill transition-transform duration-(--glyph-duration-slow) ease-standard',
      'data-[state=indeterminate]:w-1/3 data-[state=indeterminate]:animate-pulse',
    ],
  },
  variants: {
    size: {
      sm: { track: 'h-1' },
      md: { track: 'h-2' },
      lg: { track: 'h-3' },
    },
    tone: {
      primary: { indicator: 'bg-primary' },
      neutral: { indicator: 'bg-foreground' },
      success: { indicator: 'bg-success' },
      warning: { indicator: 'bg-warning' },
      danger: { indicator: 'bg-danger' },
    },
  },
  defaultVariants: { size: 'md', tone: 'primary' },
})

export type ProgressVariants = VariantProps<typeof progressStyles>

export const progressCircleStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'relative inline-flex shrink-0 items-center justify-center',
    svg: 'size-full -rotate-90',
    track: 'stroke-muted',
    indicator:
      'stroke-current transition-[stroke-dashoffset] duration-(--glyph-duration-slow) ease-standard',
    value: 'absolute font-medium tabular-nums text-foreground',
  },
  variants: {
    size: {
      sm: { root: 'size-6', value: 'hidden' },
      md: { root: 'size-10', value: 'text-[0.625rem]' },
      lg: { root: 'size-16', value: 'text-small' },
    },
    tone: {
      primary: { indicator: 'text-primary' },
      neutral: { indicator: 'text-foreground' },
      success: { indicator: 'text-success' },
      warning: { indicator: 'text-warning' },
      danger: { indicator: 'text-danger' },
    },
  },
  defaultVariants: { size: 'md', tone: 'primary' },
})

export type ProgressCircleVariants = VariantProps<typeof progressCircleStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Progress: StylesEntry<typeof progressStyles>
    ProgressCircle: StylesEntry<typeof progressCircleStyles>
  }
}
