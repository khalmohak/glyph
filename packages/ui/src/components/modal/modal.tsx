import type { ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog'
import { modalStyles } from './modal.styles'

export interface ModalProps extends Omit<DialogContentProps, 'title' | 'children'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Heading of the modal. Also its accessible name. */
  title: ReactNode
  description?: ReactNode
  /** Element that opens the modal, e.g. a Button. Optional when you control `open`. */
  trigger?: ReactNode
  /** Actions at the bottom. Wrap a button in `ModalClose` to close on click. */
  footer?: ReactNode
  /** Close when the backdrop is clicked. Default true. */
  closeOnOverlayClick?: boolean
  children?: ReactNode
}

/**
 * The everyday modal in one component: title, description, body and footer as props.
 * For custom layouts use the Dialog parts; for yes/no decisions use `useConfirm()`.
 */
export function Modal(inProps: ModalProps) {
  const [props, slots] = useComponentConfig('Modal', inProps)
  const {
    open,
    defaultOpen,
    onOpenChange,
    title,
    description,
    trigger,
    footer,
    closeOnOverlayClick = true,
    onPointerDownOutside,
    className,
    children,
    ...rest
  } = props
  const s = modalStyles()

  return (
    <Dialog
      {...(open !== undefined && { open })}
      {...(defaultOpen !== undefined && { defaultOpen })}
      {...(onOpenChange && { onOpenChange })}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        data-slot="modal"
        className={s.content({ class: [slots.content, className] })}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event)
          if (!closeOnOverlayClick) event.preventDefault()
        }}
        {...(!description && { 'aria-describedby': undefined })}
        {...rest}
      >
        <DialogHeader className={s.header({ class: slots.header })}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <DialogBody className={s.body({ class: slots.body })}>{children}</DialogBody>}
        {footer && (
          <DialogFooter className={s.footer({ class: slots.footer })}>{footer}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Closes the surrounding Modal. Use with `asChild` around a button. */
export const ModalClose: typeof DialogClose = DialogClose
