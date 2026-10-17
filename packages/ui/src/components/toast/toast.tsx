import type { ComponentProps } from 'react'
import { Toaster as Sonner, toast } from 'sonner'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const toastStyles = /* @__PURE__ */ tv({
  slots: {
    toast: [
      'group flex w-(--width) items-start gap-3 rounded-lg border-border bg-raised p-4 text-small text-foreground shadow-lg',
      themedBorder,
    ],
    content: 'flex min-w-0 flex-1 flex-col gap-0.5',
    title: 'font-medium text-foreground',
    description: 'text-muted-foreground',
    icon: 'mt-0.5 flex size-4 shrink-0 items-center justify-center [&>svg]:size-4',
    actionButton: [
      'inline-flex h-7 shrink-0 cursor-pointer items-center rounded-sm bg-primary px-2.5 text-caption font-medium text-primary-foreground hover:bg-primary/88',
      transition,
      focusRing,
    ],
    cancelButton: [
      'inline-flex h-7 shrink-0 cursor-pointer items-center rounded-sm bg-muted px-2.5 text-caption font-medium text-muted-foreground hover:text-foreground',
      transition,
      focusRing,
    ],
    closeButton: [
      'absolute -top-2 -left-2 flex size-5 cursor-pointer items-center justify-center rounded-pill border-border bg-raised text-muted-foreground shadow-xs hover:text-foreground [&>svg]:size-3',
      themedBorder,
      focusRing,
    ],
    success: '[&_[data-icon]]:text-success',
    error: '[&_[data-icon]]:text-danger',
    warning: '[&_[data-icon]]:text-warning',
    info: '[&_[data-icon]]:text-info',
    loading: '[&_[data-icon]]:text-muted-foreground',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Toast: StylesEntry<typeof toastStyles>
  }
}

export type ToasterProps = ComponentProps<typeof Sonner>

/**
 * Renders toasts sent with `toast()`. Mount once near the root. Styled entirely by the
 * theme's tokens, so it follows the theme and color mode automatically.
 *
 * ```tsx
 * toast.success('Saved')
 * toast.promise(save(), { loading: 'Saving…', success: 'Saved', error: 'Couldn’t save' })
 * ```
 */
export function Toaster(inProps: ToasterProps) {
  const [props, slots] = useComponentConfig('Toast', inProps)
  const { toastOptions, position = 'bottom-right', ...rest } = props
  const s = toastStyles()
  const classNames = toastOptions?.classNames ?? {}
  return (
    <Sonner
      position={position}
      gap={10}
      {...rest}
      toastOptions={{
        ...toastOptions,
        unstyled: true,
        classNames: {
          toast: s.toast({ class: [slots.toast, classNames.toast] }),
          content: s.content({ class: [slots.content, classNames.content] }),
          title: s.title({ class: [slots.title, classNames.title] }),
          description: s.description({ class: [slots.description, classNames.description] }),
          icon: s.icon({ class: [slots.icon, classNames.icon] }),
          actionButton: s.actionButton({ class: [slots.actionButton, classNames.actionButton] }),
          cancelButton: s.cancelButton({ class: [slots.cancelButton, classNames.cancelButton] }),
          closeButton: s.closeButton({ class: [slots.closeButton, classNames.closeButton] }),
          success: s.success({ class: [slots.success, classNames.success] }),
          error: s.error({ class: [slots.error, classNames.error] }),
          warning: s.warning({ class: [slots.warning, classNames.warning] }),
          info: s.info({ class: [slots.info, classNames.info] }),
          loading: s.loading({ class: [slots.loading, classNames.loading] }),
        },
      }}
    />
  )
}

export { toast }
