import { tv, type VariantProps } from '../../utils/tv'

export const avatarStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-pill bg-muted align-middle',
    image: 'size-full object-cover',
    fallback: 'flex size-full items-center justify-center font-medium text-muted-foreground',
    group:
      'flex items-center -space-x-2 [&>[data-slot=avatar]]:ring-2 [&>[data-slot=avatar]]:ring-background',
  },
  variants: {
    size: {
      xs: { root: 'size-5', fallback: 'text-[0.5625rem]' },
      sm: { root: 'size-6', fallback: 'text-[0.625rem]' },
      md: { root: 'size-8', fallback: 'text-caption' },
      lg: { root: 'size-11', fallback: 'text-small' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type AvatarVariants = VariantProps<typeof avatarStyles>
