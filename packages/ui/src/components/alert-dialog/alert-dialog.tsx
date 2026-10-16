import { AlertDialog as AlertDialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { Button, type ButtonProps } from '../button'
import { alertDialogStyles } from './alert-dialog.styles'

function useParts() {
  const [, slots] = useComponentConfig('AlertDialog', {})
  return { s: alertDialogStyles(), slots }
}

/**
 * A modal that interrupts to ask for a decision, e.g. confirming a destructive action.
 * Unlike Dialog it can't be dismissed by clicking outside. For a one-line confirm, use `useConfirm()`.
 */
export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger

export interface AlertDialogContentProps
  extends ComponentProps<typeof AlertDialogPrimitive.Content> {
  overlayClassName?: string
}

export function AlertDialogContent(inProps: AlertDialogContentProps) {
  const [props, slots] = useComponentConfig('AlertDialog', inProps)
  const { overlayClassName, className, ...rest } = props
  const s = alertDialogStyles()
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay
        data-slot="alert-dialog-overlay"
        className={s.overlay({ class: [slots.overlay, overlayClassName] })}
      />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={s.content({ class: [slots.content, className] })}
        {...rest}
      />
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="alert-dialog-header"
      className={s.header({ class: [slots.header, className] })}
      {...props}
    />
  )
}

export function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  const { s, slots } = useParts()
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={s.title({ class: [slots.title, className] })}
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  const { s, slots } = useParts()
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={s.description({ class: [slots.description, className] })}
      {...props}
    />
  )
}

export function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="alert-dialog-footer"
      className={s.footer({ class: [slots.footer, className] })}
      {...props}
    />
  )
}

export interface AlertDialogActionProps extends Omit<ButtonProps, 'variant' | 'asChild'> {
  /** `danger` for destructive actions. */
  tone?: 'default' | 'danger'
}

/** The confirming button. Closes the dialog. */
export function AlertDialogAction({ tone = 'default', ...props }: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <Button
        data-slot="alert-dialog-action"
        variant={tone === 'danger' ? 'danger' : 'primary'}
        {...props}
      />
    </AlertDialogPrimitive.Action>
  )
}

/** The dismissing button. Receives focus when the dialog opens, so Enter never confirms by accident. */
export function AlertDialogCancel(props: Omit<ButtonProps, 'variant' | 'asChild'>) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button data-slot="alert-dialog-cancel" variant="outline" {...props} />
    </AlertDialogPrimitive.Cancel>
  )
}
