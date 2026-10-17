import { AspectRatio as AspectRatioPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const aspectRatioStyles = /* @__PURE__ */ tv({
  slots: {
    base: 'overflow-hidden [&>img]:size-full [&>img]:object-cover [&>video]:size-full [&>video]:object-cover',
  },
  variants: {
    rounded: { true: { base: 'rounded-lg' } },
    placeholder: { true: { base: 'bg-muted' } },
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    AspectRatio: StylesEntry<typeof aspectRatioStyles>
  }
}

export interface AspectRatioProps
  extends ComponentProps<typeof AspectRatioPrimitive.Root>,
    VariantProps<typeof aspectRatioStyles> {}

/** Keeps media at a fixed width-to-height ratio, e.g. `ratio={16 / 9}`. Images inside cover the box. */
export function AspectRatio(inProps: AspectRatioProps) {
  const [props, slots] = useComponentConfig('AspectRatio', inProps)
  const { rounded, placeholder, className, ...rest } = props
  return (
    <AspectRatioPrimitive.Root
      data-slot="aspect-ratio"
      className={aspectRatioStyles({ rounded, placeholder }).base({
        class: [slots.base, className],
      })}
      {...rest}
    />
  )
}
