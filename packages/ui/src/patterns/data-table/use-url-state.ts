import type { ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { DataTableState, DataTableStateKey } from './types'

/** Where URL state is read from and written to. The default uses `window.history`. */
export interface UrlAdapter {
  /** The current query string, with or without the leading `?`. */
  getSearch: () => string
  /** Writes a new query string. `push` adds a history entry; `replace` doesn't. */
  setSearch: (search: string, mode: 'push' | 'replace') => void
  /** Calls `onChange` when the query string changes (back and forward buttons included). */
  subscribe: (onChange: () => void) => () => void
}

const URL_EVENT = 'glyph:urlchange'

/** Reads and writes `location.search` with the History API, so it works with any router. */
export const historyAdapter: UrlAdapter = {
  getSearch: () => (typeof window === 'undefined' ? '' : window.location.search),
  setSearch: (search, mode) => {
    const url = `${window.location.pathname}${search}${window.location.hash}`
    // Keep the router's history state (React Router stores its key and index there).
    if (mode === 'push') window.history.pushState(window.history.state, '', url)
    else window.history.replaceState(window.history.state, '', url)
    window.dispatchEvent(new Event(URL_EVENT))
  },
  subscribe: (onChange) => {
    window.addEventListener('popstate', onChange)
    window.addEventListener(URL_EVENT, onChange)
    return () => {
      window.removeEventListener('popstate', onChange)
      window.removeEventListener(URL_EVENT, onChange)
    }
  },
}

type UrlSlice = 'pagination' | 'sorting' | 'search' | 'columnFilters' | 'columnVisibility'

export interface UseTableUrlStateOptions {
  /**
   * Prefix for every parameter, so two tables on one page don't clash: with `"inv"` the
   * page is `inv.page`. Default none.
   */
  prefix?: string
  /** Page size used when the URL has none. Default 10. */
  pageSize?: number
  /** Which slices live in the URL. Default: pagination, sorting, search, filters, visibility. */
  slices?: readonly UrlSlice[]
  /** Waits this long after typing before writing the search to the URL. Default 300 ms. */
  searchDebounce?: number
  /** Swap in your router's search params. Defaults to the History API. */
  adapter?: UrlAdapter
}

export interface TableUrlState {
  /** Pass to DataTable: the URL-backed slices. */
  state: Partial<DataTableState>
  /** Pass to DataTable: writes changes back to the URL. */
  onStateChange: (state: DataTableState, changed: DataTableStateKey) => void
  /** Clears every table parameter from the URL. */
  reset: () => void
}

const ALL_SLICES: readonly UrlSlice[] = [
  'pagination',
  'sorting',
  'search',
  'columnFilters',
  'columnVisibility',
]

const RANGE = '..'

function encodeFilter(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>
    if ('min' in v || 'max' in v) return [`${v.min ?? ''}${RANGE}${v.max ?? ''}`]
    if ('from' in v || 'to' in v) return [`${v.from ?? ''}${RANGE}${v.to ?? ''}`]
  }
  return value === undefined || value === null || value === '' ? [] : [String(value)]
}

function decodeFilter(values: string[]): unknown {
  if (values.length > 1) return values
  const [value = ''] = values
  const at = value.indexOf(RANGE)
  if (at !== -1) {
    const lo = value.slice(0, at)
    const hi = value.slice(at + RANGE.length)
    const isNumber = (s: string) => s === '' || Number.isFinite(Number(s))
    const isDay = (s: string) => s === '' || /^\d{4}-\d{2}-\d{2}$/.test(s)
    if (isNumber(lo) && isNumber(hi))
      return {
        ...(lo !== '' && { min: Number(lo) }),
        ...(hi !== '' && { max: Number(hi) }),
      }
    if (isDay(lo) && isDay(hi)) return { ...(lo && { from: lo }), ...(hi && { to: hi }) }
  }
  return value
}

/** Reads table state from a query string. Exported for tests and server-side rendering. */
export function parseTableSearch(
  search: string,
  { prefix = '', pageSize = 10, slices = ALL_SLICES }: UseTableUrlStateOptions = {},
): Partial<DataTableState> {
  const params = new URLSearchParams(search)
  const key = (name: string) => (prefix ? `${prefix}.${name}` : name)
  const state: Partial<DataTableState> = {}

  if (slices.includes('pagination')) {
    const page = Math.max(1, Number.parseInt(params.get(key('page')) ?? '1', 10) || 1)
    const size = Number.parseInt(params.get(key('size')) ?? '', 10)
    state.pagination = { pageIndex: page - 1, pageSize: size > 0 ? size : pageSize }
  }
  if (slices.includes('sorting')) {
    const raw = params.get(key('sort'))
    state.sorting = raw
      ? raw
          .split(',')
          .filter(Boolean)
          .map((part): SortingState[number] => {
            const desc = part.endsWith('.desc')
            const id = part.replace(/\.(asc|desc)$/, '')
            return { id, desc }
          })
      : []
  }
  if (slices.includes('search')) state.search = params.get(key('q')) ?? ''
  if (slices.includes('columnFilters')) {
    const filterPrefix = key('f.')
    const ids = new Set<string>()
    for (const name of params.keys()) if (name.startsWith(filterPrefix)) ids.add(name)
    const filters: ColumnFiltersState = []
    for (const name of ids) {
      filters.push({
        id: name.slice(filterPrefix.length),
        value: decodeFilter(params.getAll(name)),
      })
    }
    state.columnFilters = filters
  }
  if (slices.includes('columnVisibility')) {
    const hidden = params.get(key('hide'))
    const visibility: VisibilityState = {}
    for (const id of hidden ? hidden.split(',') : []) if (id) visibility[id] = false
    state.columnVisibility = visibility
  }
  return state
}

/** Writes table state into a query string, keeping unrelated parameters. */
export function writeTableSearch(
  search: string,
  state: Partial<DataTableState>,
  { prefix = '', pageSize = 10, slices = ALL_SLICES }: UseTableUrlStateOptions = {},
): string {
  const params = new URLSearchParams(search)
  const key = (name: string) => (prefix ? `${prefix}.${name}` : name)
  const set = (name: string, value: string | undefined) => {
    if (value) params.set(key(name), value)
    else params.delete(key(name))
  }

  if (slices.includes('pagination') && state.pagination) {
    const { pageIndex, pageSize: size } = state.pagination
    set('page', pageIndex > 0 ? String(pageIndex + 1) : undefined)
    set('size', size !== pageSize ? String(size) : undefined)
  }
  if (slices.includes('sorting') && state.sorting) {
    set(
      'sort',
      state.sorting.map((sort) => (sort.desc ? `${sort.id}.desc` : sort.id)).join(',') || undefined,
    )
  }
  if (slices.includes('search') && state.search !== undefined) set('q', state.search || undefined)
  if (slices.includes('columnFilters') && state.columnFilters) {
    const filterPrefix = key('f.')
    for (const name of [...params.keys()]) if (name.startsWith(filterPrefix)) params.delete(name)
    for (const filter of state.columnFilters) {
      for (const value of encodeFilter(filter.value))
        params.append(`${filterPrefix}${filter.id}`, value)
    }
  }
  if (slices.includes('columnVisibility') && state.columnVisibility) {
    const hidden = Object.entries(state.columnVisibility)
      .filter(([, visible]) => !visible)
      .map(([id]) => id)
    set('hide', hidden.join(',') || undefined)
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

const subscribeNoop = () => () => {}

/**
 * Keeps a DataTable's page, sort, search, filters and hidden columns in the URL, so views
 * can be shared and the back button works. Router-agnostic: it uses the History API unless
 * you pass an `adapter`.
 *
 * ```tsx
 * const url = useTableUrlState()
 * <DataTable data={rows} columns={columns} {...url} />
 * ```
 *
 * Page, sort and filter changes add a history entry; typing in search replaces it.
 */
export function useTableUrlState(options: UseTableUrlStateOptions = {}): TableUrlState {
  const { adapter = historyAdapter, searchDebounce = 300 } = options
  const optionsRef = useRef(options)
  optionsRef.current = options

  const search = useSyncExternalStore(
    typeof window === 'undefined' ? subscribeNoop : adapter.subscribe,
    adapter.getSearch,
    () => '',
  )
  const fromUrl = useMemo(() => parseTableSearch(search, optionsRef.current), [search])

  // Typing shows immediately; the URL catches up after the debounce.
  const [pendingSearch, setPendingSearch] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const typing = useRef(false)
  useEffect(() => () => clearTimeout(timer.current), [])

  // The query string this hook last wrote. Any other change (back, forward, a link) while
  // a search is still being typed wins: the typed text is dropped instead of being written
  // over the page the user navigated to.
  const written = useRef<string | null>(null)
  useEffect(() => {
    if (!typing.current || normalize(search) === written.current) return
    clearTimeout(timer.current)
    typing.current = false
    setPendingSearch(null)
  }, [search])

  // Changes from one user action (a sort that also resets the page) land in one history
  // entry: they are collected and written together at the end of the task.
  const queued = useRef<{ state: Partial<DataTableState>; push: boolean } | null>(null)
  const write = useCallback(
    (state: Partial<DataTableState>, mode: 'push' | 'replace') => {
      if (queued.current) {
        Object.assign(queued.current.state, state)
        queued.current.push ||= mode === 'push'
        return
      }
      queued.current = { state: { ...state }, push: mode === 'push' }
      queueMicrotask(() => {
        const batch = queued.current
        queued.current = null
        if (!batch) return
        const next = writeTableSearch(adapter.getSearch(), batch.state, optionsRef.current)
        written.current = next
        if (next !== normalize(adapter.getSearch()))
          adapter.setSearch(next, batch.push ? 'push' : 'replace')
      })
    },
    [adapter],
  )

  const onStateChange = useCallback(
    (state: DataTableState, changed: DataTableStateKey) => {
      const slices = optionsRef.current.slices ?? ALL_SLICES
      if (!slices.includes(changed as UrlSlice)) return
      if (changed === 'search') {
        setPendingSearch(state.search)
        clearTimeout(timer.current)
        typing.current = true
        written.current = normalize(adapter.getSearch())
        timer.current = setTimeout(() => {
          typing.current = false
          // The page resets with the search; both land in one history entry.
          write({ search: state.search, pagination: state.pagination }, 'replace')
          setPendingSearch(null)
        }, searchDebounce)
        return
      }
      write({ [changed]: state[changed] }, changed === 'columnVisibility' ? 'replace' : 'push')
    },
    [write, searchDebounce, adapter],
  )

  const reset = useCallback(() => {
    clearTimeout(timer.current)
    typing.current = false
    setPendingSearch(null)
    const params = new URLSearchParams(adapter.getSearch())
    const prefix = optionsRef.current.prefix
    for (const name of [...params.keys()]) {
      const bare = prefix
        ? name.startsWith(`${prefix}.`)
          ? name.slice(prefix.length + 1)
          : null
        : name
      if (bare === null) continue
      if (['page', 'size', 'sort', 'q', 'hide'].includes(bare) || bare.startsWith('f.'))
        params.delete(name)
    }
    const text = params.toString()
    adapter.setSearch(text ? `?${text}` : '', 'push')
  }, [adapter])

  const state = useMemo(
    () => (pendingSearch === null ? fromUrl : { ...fromUrl, search: pendingSearch }),
    [fromUrl, pendingSearch],
  )

  return { state, onStateChange, reset }
}

function normalize(search: string) {
  return search === '?' ? '' : search
}
