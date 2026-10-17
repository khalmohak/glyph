import {
  createContext,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

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

// The dialog loads the first time confirm() is called, so apps that never confirm don't ship it.
const ConfirmDialog = lazy(() =>
  import('./confirm-dialog').then((m) => ({ default: m.ConfirmDialog })),
)

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

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {options && (
        <Suspense fallback={null}>
          <ConfirmDialog open={open} options={options} onSettle={settle} />
        </Suspense>
      )}
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
