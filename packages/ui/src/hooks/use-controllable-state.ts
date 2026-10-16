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
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
      if (!isControlled) setInternal(resolved)
      onChangeRef.current?.(resolved)
    },
    [current, isControlled],
  )

  return [current, setValue] as const
}
