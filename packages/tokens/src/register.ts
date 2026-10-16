/**
 * Component registry. Empty here so this package stays framework-free; component packages
 * augment it with each component's variant and slot types:
 *
 * ```ts
 * declare module '@glyphkit/tokens' {
 *   interface GlyphComponentRegistry {
 *     Button: ComponentEntry<ButtonVariants, 'base'>
 *   }
 * }
 * ```
 *
 * `theme.components` is then fully typed for every registered component.
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmented by component packages
export interface GlyphComponentRegistry {}

export interface ComponentEntry<Variants = object, Slots extends string = string> {
  variants: Variants
  slots: Slots
}

export type ComponentOverride<Entry> =
  Entry extends ComponentEntry<infer Variants, infer Slots>
    ? {
        /** Variants applied when a prop is not passed. */
        defaultVariants?: { [K in keyof Variants]?: Exclude<Variants[K], undefined> }
        /** Extra classes per slot, merged before the `className` passed at the call site. */
        className?: Partial<Record<Slots, string>>
      }
    : never

export type ComponentOverrides = {
  [K in keyof GlyphComponentRegistry]?: ComponentOverride<GlyphComponentRegistry[K]>
}

export type ComponentName = keyof GlyphComponentRegistry
