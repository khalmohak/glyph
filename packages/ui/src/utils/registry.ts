import type { ComponentEntry } from '@glyphui/tokens'
import type { VariantProps } from 'tailwind-variants'

/** Derives a registry entry (variant props + slot names) from a component's `tv()` styles. */
// biome-ignore lint/suspicious/noExplicitAny: matches tailwind-variants' own constraint
export type StylesEntry<T extends ((...args: any) => any) & { slots: unknown }> = ComponentEntry<
  VariantProps<T>,
  Extract<keyof NonNullable<T['slots']>, string>
>
