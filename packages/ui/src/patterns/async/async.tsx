import { type DependencyList, type ReactNode, useCallback, useEffect, useState } from 'react'
import { EmptyState, ErrorState, LoadingState } from './states'

export type AsyncStatus = 'pending' | 'error' | 'success'

/**
 * The shape of an async result. TanStack Query's `useQuery()` result matches it, as does
 * Glyph's own `useAsync()`.
 */
export interface AsyncResult<T> {
  status: AsyncStatus
  data?: T | undefined
  error?: unknown
  refetch?: () => unknown
}

export interface AsyncProps<T> {
  result: AsyncResult<T>
  /** Rendered once data is ready and not empty. */
  children: (data: NonNullable<T>) => ReactNode
  /** Treat ready data as empty. Defaults to: an empty array. */
  isEmpty?: (data: NonNullable<T>) => boolean
  loading?: ReactNode
  empty?: ReactNode
  error?: ReactNode | ((error: unknown, retry: (() => unknown) | undefined) => ReactNode)
}

const defaultIsEmpty = (data: unknown) => Array.isArray(data) && data.length === 0

/**
 * Renders the right UI for every state of an async result: loading, error (with retry),
 * empty, or your content. One convention for every data-driven screen.
 *
 * ```tsx
 * <Async result={useQuery(...)} empty={<EmptyState title="No invoices yet" />}>
 *   {(invoices) => <InvoiceList invoices={invoices} />}
 * </Async>
 * ```
 */
export function Async<T>({
  result,
  children,
  isEmpty = defaultIsEmpty,
  loading,
  empty,
  error,
}: AsyncProps<T>) {
  if (result.status === 'pending') return loading ?? <LoadingState />
  if (result.status === 'error') {
    if (typeof error === 'function') return error(result.error, result.refetch)
    return error ?? <ErrorState error={result.error} onRetry={result.refetch} />
  }
  const data = result.data
  if (data === undefined || data === null || isEmpty(data)) {
    return empty ?? <EmptyState title="Nothing here yet" />
  }
  return children(data)
}

/**
 * Runs an async function and tracks its state as an `AsyncResult`. Re-runs when `deps`
 * change; stale responses are ignored. For caching and deduping, use TanStack Query.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): AsyncResult<T> {
  const [state, setState] = useState<Omit<AsyncResult<T>, 'refetch'>>({ status: 'pending' })
  const [run, setRun] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: caller controls re-runs through deps
  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, status: 'pending' }))
    // A function that throws before returning a promise is an error state, not a crash.
    let promise: Promise<T>
    try {
      promise = Promise.resolve(fn())
    } catch (error) {
      promise = Promise.reject(error)
    }
    promise.then(
      (data) => active && setState({ status: 'success', data }),
      (error: unknown) => active && setState({ status: 'error', error }),
    )
    return () => {
      active = false
    }
  }, [...deps, run])

  const refetch = useCallback(() => setRun((n) => n + 1), [])
  return { ...state, refetch }
}
