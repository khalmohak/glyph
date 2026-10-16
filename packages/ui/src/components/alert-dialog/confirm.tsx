import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
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

export interface ConfirmOptions {
  title: ReactNode
  description?: ReactNode
  /** Default "Confirm", or "Delete" when `tone` is `danger`. */
  confirmLabel?: ReactNode
  cancelLabel?: ReactNode
  tone?: 'default' | 'danger'
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

interface Pending {
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

/**
 * Enables `useConfirm()` for everything inside. Renders one shared AlertDialog.
 * Mount once near the root (inside GlyphProvider).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null)
  const [open, setOpen] = useState(false)
  const pendingRef = useRef<Pending | null>(null)

  const settle = useCallback((value: boolean) => {
    pendingRef.current?.resolve(value)
    pendingRef.current = null
    setOpen(false)
  }, [])

  const confirm = useCallback<ConfirmFn>((options) => {
    // A new request cancels one that is still open.
    pendingRef.current?.resolve(false)
    return new Promise<boolean>((resolve) => {
      const next = { options, resolve }
      pendingRef.current = next
      setPending(next)
      setOpen(true)
    })
  }, [])

  const value = useMemo(() => confirm, [confirm])
  const options = pending?.options
  const danger = options?.tone === 'danger'

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <AlertDialog open={open} onOpenChange={(next) => !next && settle(false)}>
        {options && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
              {options.description && (
                <AlertDialogDescription>{options.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => settle(false)}>
                {options.cancelLabel ?? 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction tone={options.tone} onClick={() => settle(true)}>
                {options.confirmLabel ?? (danger ? 'Delete' : 'Confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

/**
 * Ask the user to confirm, in one line:
 *
 * ```tsx
 * const confirm = useConfirm()
 * if (await confirm({ title: 'Delete project?', tone: 'danger' })) await deleteProject()
 * ```
 *
 * Resolves `true` when confirmed, `false` when cancelled or dismissed with Escape.
 */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext)
  if (!confirm)
    throw new Error('useConfirm must be used inside <ConfirmProvider> (or <GlyphProvider>).')
  return confirm
}
