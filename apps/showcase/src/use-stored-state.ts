import { useEffect, useState } from 'react'

/** useState persisted to localStorage. Falls back to memory when storage is unavailable. */
export function useStoredState<T extends string>(
  key: string,
  initial: T,
  allowed: readonly T[],
  paramName?: string,
) {
  const [value, setValue] = useState<T>(() => {
    try {
      // A `?<key>=value` URL parameter wins, so a specific state can be linked to.
      const param = new URLSearchParams(window.location.search).get(paramName ?? key)
      if (allowed.includes(param as T)) return param as T
      const stored = localStorage.getItem(key)
      return allowed.includes(stored as T) ? (stored as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Storage blocked: the choice still applies for this visit.
    }
  }, [key, value])
  return [value, setValue] as const
}
