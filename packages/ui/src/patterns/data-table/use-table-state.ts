import type { Updater } from '@tanstack/react-table'
import { useCallback, useRef, useState } from 'react'
import type { DataTableState, DataTableStateKey } from './types'

export const defaultTableState: DataTableState = {
  pagination: { pageIndex: 0, pageSize: 10 },
  sorting: [],
  search: '',
  columnFilters: [],
  columnVisibility: {},
  columnSizing: {},
  columnPinning: {},
  columnOrder: [],
  rowSelection: {},
  allMatchingSelected: false,
  expanded: {},
  density: 'default',
}

export interface UseTableStateOptions {
  /** Controlled slices. A slice set here is owned by the parent. */
  state?: Partial<DataTableState> | undefined
  /** Starting values for uncontrolled slices. */
  defaultState?: Partial<DataTableState> | undefined
  /** Called with the full next state whenever any slice changes. */
  onStateChange?: ((state: DataTableState, changed: DataTableStateKey) => void) | undefined
}

export type SetTableState = <K extends DataTableStateKey>(
  key: K,
  updater: Updater<DataTableState[K]>,
) => void

/**
 * DataTable's state: every slice is controlled when `state` has it, uncontrolled otherwise.
 * Several updates in one event (a filter change resetting the page, say) chain correctly
 * because each update reads the result of the previous one.
 */
export function useTableState({
  state,
  defaultState,
  onStateChange,
}: UseTableStateOptions): [DataTableState, SetTableState] {
  const [internal, setInternal] = useState<DataTableState>(() => ({
    ...defaultTableState,
    ...defaultState,
  }))
  const merged = { ...internal } as DataTableState
  if (state) {
    for (const key of Object.keys(state) as DataTableStateKey[]) {
      if (state[key] !== undefined) (merged as unknown as Record<string, unknown>)[key] = state[key]
    }
  }

  // The latest state, including updates made earlier in the same event.
  const latest = useRef(merged)
  latest.current = merged
  const controlled = useRef(state)
  controlled.current = state
  const callback = useRef(onStateChange)
  callback.current = onStateChange

  const set = useCallback<SetTableState>((key, updater) => {
    const previous = latest.current[key]
    const value =
      typeof updater === 'function'
        ? (updater as (old: typeof previous) => typeof previous)(previous)
        : updater
    if (Object.is(value, previous)) return
    const next = { ...latest.current, [key]: value }
    latest.current = next
    if (controlled.current?.[key] === undefined) {
      setInternal((current) => ({ ...current, [key]: value }))
    }
    callback.current?.(next, key)
  }, [])

  return [merged, set]
}
