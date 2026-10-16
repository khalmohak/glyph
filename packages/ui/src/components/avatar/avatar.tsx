import { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentProps, CSSProperties } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type AvatarVariants, avatarStyles } from './avatar.styles'

export interface AvatarProps extends ComponentProps<typeof AvatarPrimitive.Root>, AvatarVariants {
  /** Used for the image alt text and the initials fallback. */
  name: string
  src?: string | undefined
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

/** A stable hue per name, so fallback avatars are distinguishable but not random. */
function hue(name: string): number {
  let h = 0
  for (const char of name) h = (h * 31 + char.charCodeAt(0)) % 360
  return h
}

export function Avatar(inProps: AvatarProps) {
  const [props, slots] = useComponentConfig('Avatar', inProps)
  const { name, src, size, className, style, ...rest } = props
  const s = avatarStyles({ size })
  const tint = { '--avatar-hue': hue(name), ...style } as CSSProperties
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={s.root({ class: [slots.root, className] })}
      style={tint}
      {...rest}
    >
      {src && (
        <AvatarPrimitive.Image src={src} alt={name} className={s.image({ class: slots.image })} />
      )}
      <AvatarPrimitive.Fallback
        className={s.fallback({
          class: ['bg-[oklch(68%_0.11_var(--avatar-hue)/0.22)] text-foreground', slots.fallback],
        })}
        aria-label={src ? undefined : name}
      >
        {initials(name)}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}

export function AvatarGroup({ className, ...props }: ComponentProps<'div'>) {
  const [, slots] = useComponentConfig('Avatar', {})
  return (
    <div
      data-slot="avatar-group"
      className={avatarStyles().group({ class: [slots.group, className] })}
      {...props}
    />
  )
}
