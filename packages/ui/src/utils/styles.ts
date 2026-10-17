/** Shared class fragments. Kept as literals so Tailwind's scanner picks them up. */

export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const themedBorder = 'border-(length:--glyph-border-width)'

export const transition =
  'transition-[color,background-color,border-color,box-shadow,transform,translate,scale,opacity] duration-(--glyph-duration-base) ease-standard'

/**
 * Enter and exit for anything Radix positions next to a trigger: springs out of the trigger
 * (pair with the primitive's transform-origin class) and leaves quickly. Distance and scale
 * follow the motion level; the side moves it toward the trigger.
 */
export const popoverMotion =
  'animate-pop-in data-[state=closed]:animate-pop-out data-[side=bottom]:[--glyph-motion-y:calc(var(--glyph-motion-distance)*-1)] data-[side=top]:[--glyph-motion-y:var(--glyph-motion-distance)] data-[side=left]:[--glyph-motion-x:var(--glyph-motion-distance)] data-[side=right]:[--glyph-motion-x:calc(var(--glyph-motion-distance)*-1)]'

/** Popover surfaces: Select, Tooltip-like menus. */
export const popover = `z-50 overflow-hidden rounded-[min(var(--radius-md),var(--radius-lg))] border-(length:--glyph-border-width) border-border bg-raised text-foreground shadow-lg ${popoverMotion}`

/** Dimmed backdrop behind dialogs and sheets. */
export const overlayMotion =
  'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out'

/** Centered dialogs: rise and scale in on the theme's spring, settle out quickly. */
export const dialogMotion = 'animate-dialog-in data-[state=closed]:animate-dialog-out'
