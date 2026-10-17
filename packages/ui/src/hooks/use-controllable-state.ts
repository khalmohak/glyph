import { useCallback, useRef, useState } from 'react'

interface Options<T> {
  value?: T | undefined
  defaultValue: T
  onChange?: ((value: T) => void) | undefined
}

/** State that can be controlled by a parent (`value` + `onChange`) or left uncontrolled. */
export function useControllableState<T>({ value, defaultValue, onChange }: Options<T>) {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? value : internal

  // Refs keep the setter stable and let several functional updates in one event build on
  // each other instead of all reading the value from the last render.
  const latest = useRef(current)
  latest.current = current
  const controlled = useRef(isControlled)
  controlled.current = isControlled
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setValue = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === 'function' ? (next as (prev: T) => T)(latest.current) : next
    latest.current = resolved
    if (!controlled.current) setInternal(resolved)
    onChangeRef.current?.(resolved)
  }, [])

  return [current, setValue] as const
}
