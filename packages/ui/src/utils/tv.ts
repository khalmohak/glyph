import { createTV, type VariantProps } from 'tailwind-variants'
import { twMergeConfig } from './tw-merge-config'

/** `tailwind-variants` preconfigured with Glyph's merge rules. All component styles use this. */
export const tv = createTV({ twMergeConfig })

export type { VariantProps }
