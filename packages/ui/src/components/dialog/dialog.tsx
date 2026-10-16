import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { CloseIcon } from './close-icon'
import { type DialogVariants, dialogStyles } from './dialog.styles'

function useParts() {
  const [, slots] = useComponentConfig('Dialog', {})
  return { s: dialogStyles(), slots }
}

/** A modal window. Focus is trapped inside and returns to the trigger on close. */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export interface DialogContentProps
  extends ComponentProps<typeof DialogPrimitive.Content>,
    DialogVariants {
  /** Show the close button in the corner. Default true. */
  showClose?: boolean
  overlayClassName?: string
}

export function DialogContent(inProps: DialogContentProps) {
  const [props, slots] = useComponentConfig('Dialog', inProps)
  const { size, showClose = true, overlayClassName, className, children, ...rest } = props
  const s = dialogStyles({ size })
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className={s.overlay({ class: [slots.overlay, overlayClassName] })}
      />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={s.content({ class: [slots.content, className] })}
        {...rest}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            aria-label="Close"
            className={s.close({ class: slots.close })}
          >
            <CloseIcon />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="dialog-header"
      className={s.header({ class: [slots.header, className] })}
      {...props}
    />
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  const { s, slots } = useParts()
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={s.title({ class: [slots.title, className] })}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  const { s, slots } = useParts()
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={s.description({ class: [slots.description, className] })}
      {...props}
    />
  )
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="dialog-body"
      className={s.body({ class: [slots.body, className] })}
      {...props}
    />
  )
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="dialog-footer"
      className={s.footer({ class: [slots.footer, className] })}
      {...props}
    />
  )
}
