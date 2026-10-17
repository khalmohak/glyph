import type { ComponentEntry } from '@glyphui/tokens'
import {
  cn,
  ErrorState,
  IconButton,
  LoadingState,
  Tooltip,
  tv,
  type VariantProps,
} from '@glyphui/ui'
import type { ComponentProps, ReactNode } from 'react'

/** Derives a theme registry entry (variant props + slot names) from a viewer's `tv()` styles. */
// biome-ignore lint/suspicious/noExplicitAny: matches tailwind-variants' own constraint
export type StylesEntry<T extends ((...args: any) => any) & { slots: unknown }> = ComponentEntry<
  VariantProps<T>,
  Extract<keyof NonNullable<T['slots']>, string>
>

export const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

/**
 * The shared viewer frame: a surface with a toolbar, a body and an optional status line.
 * Each viewer extends it, so themes can restyle `root`, `toolbar`, `body` and `footer` of
 * every viewer the same way.
 */
export const viewerFrameStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'relative flex min-w-0 flex-col text-foreground',
    toolbar:
      'flex min-h-11 flex-wrap items-center gap-1 border-b border-border bg-surface px-2 py-1.5 text-small',
    group: 'flex items-center gap-1',
    spacer: 'flex-1',
    divider: 'mx-1 h-5 w-px bg-border',
    body: 'relative min-h-0 flex-1',
    footer:
      'flex flex-wrap items-center justify-between gap-2 border-t border-border bg-surface px-3 py-2 text-caption text-muted-foreground tabular-nums',
    title: 'min-w-0 truncate px-1 font-medium text-foreground',
  },
  variants: {
    bordered: {
      true: {
        root: 'overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-surface shadow-xs',
      },
      false: { root: '' },
    },
  },
  defaultVariants: { bordered: true },
})

export interface ViewerFrameProps {
  /** Draw the viewer as a bordered card. Default true. */
  bordered?: boolean
  /** Height of the viewer, e.g. `480` or `"70vh"`. Content scrolls inside. */
  height?: number | string
}

/** Turns a `height` prop into a style object. */
export function heightStyle(
  height: number | string | undefined,
  style?: ComponentProps<'div'>['style'],
) {
  return height === undefined ? style : { ...style, height }
}

/** An icon button with a tooltip label, for viewer toolbars. */
export function ToolButton({
  label,
  icon,
  shortcut,
  className,
  ...props
}: Omit<ComponentProps<typeof IconButton>, 'icon' | 'aria-label'> & {
  label: string
  icon: ReactNode
  shortcut?: string
}) {
  return (
    <Tooltip content={shortcut ? `${label} (${shortcut})` : label}>
      <IconButton
        variant="ghost"
        size="sm"
        aria-label={label}
        icon={icon}
        className={cn('text-muted-foreground', className)}
        {...props}
      />
    </Tooltip>
  )
}

/** Loading and error states inside a viewer body, matching @glyphui/ui's async states. */
export function ViewerStatus({
  status,
  error,
  label,
  onRetry,
  className,
}: {
  status: 'loading' | 'error'
  error?: unknown
  label?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex min-h-48 items-center justify-center p-6', className)}>
      {status === 'loading' ? (
        <LoadingState label={label ?? 'Loading…'} />
      ) : (
        <ErrorState error={error} {...(onRetry && { onRetry })} className="max-w-md" />
      )}
    </div>
  )
}

/** A message that it can't show the file, with an optional action (e.g. download). */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Something went wrong while opening this file.'
}
