/** Shared class fragments. Kept as literals so Tailwind's scanner picks them up. */

export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const themedBorder = 'border-(length:--glyph-border-width)'

export const transition =
  'transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-(--glyph-duration-base) ease-standard'

/** Popover surfaces: Select, Tooltip-like menus. */
export const popover =
  'z-50 overflow-hidden rounded-[min(var(--radius-md),var(--radius-lg))] border-(length:--glyph-border-width) border-border bg-raised text-foreground shadow-lg animate-pop-in'
