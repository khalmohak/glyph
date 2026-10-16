import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { CloseIcon } from '../dialog/close-icon'
import { type SheetVariants, sheetStyles } from './sheet.styles'

function useParts() {
  const [, slots] = useComponentConfig('Sheet', {})
  return { s: sheetStyles(), slots }
}

/** A panel that slides in from an edge: filters, details, settings, mobile navigation. */
export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export interface SheetContentProps
  extends ComponentProps<typeof DialogPrimitive.Content>,
    SheetVariants {
  /** Show the close button in the corner. Default true. */
  showClose?: boolean
  overlayClassName?: string
}

export function SheetContent(inProps: SheetContentProps) {
  const [props, slots] = useComponentConfig('Sheet', inProps)
  const { side, size, showClose = true, overlayClassName, className, children, ...rest } = props
  const s = sheetStyles({ side, size })
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="sheet-overlay"
        className={s.overlay({ class: [slots.overlay, overlayClassName] })}
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-side={side ?? 'right'}
        className={s.content({ class: [slots.content, className] })}
        {...rest}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            data-slot="sheet-close"
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

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="sheet-header"
      className={s.header({ class: [slots.header, className] })}
      {...props}
    />
  )
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  const { s, slots } = useParts()
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={s.title({ class: [slots.title, className] })}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  const { s, slots } = useParts()
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={s.description({ class: [slots.description, className] })}
      {...props}
    />
  )
}

export function SheetBody({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div data-slot="sheet-body" className={s.body({ class: [slots.body, className] })} {...props} />
  )
}

export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="sheet-footer"
      className={s.footer({ class: [slots.footer, className] })}
      {...props}
    />
  )
}
