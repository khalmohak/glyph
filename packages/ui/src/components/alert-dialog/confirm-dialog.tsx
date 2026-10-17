import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'
import type { ConfirmOptions } from './confirm'

export interface ConfirmDialogProps {
  open: boolean
  options: ConfirmOptions
  onSettle: (confirmed: boolean) => void
}

/** The dialog behind `useConfirm()`. Loaded lazily by ConfirmProvider. */
export function ConfirmDialog({ open, options, onSettle }: ConfirmDialogProps) {
  const danger = options.tone === 'danger'
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onSettle(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onSettle(false)}>
            {options.cancelLabel ?? 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction tone={options.tone} onClick={() => onSettle(true)}>
            {options.confirmLabel ?? (danger ? 'Delete' : 'Confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
