import type { Ref, RefCallback } from 'react'

type Cleanup = () => void

function setRef<T>(ref: Ref<T> | undefined, node: T | null): Cleanup | undefined {
  if (typeof ref === 'function') {
    const result = ref(node)
    return typeof result === 'function' ? result : undefined
  }
  if (ref) ref.current = node
  return undefined
}

/**
 * Combines several refs into one callback ref. Supports React 19 callback refs that return
 * a cleanup: on detach that cleanup runs instead of calling the ref with `null`.
 */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => setRef(ref, node))
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index]
        if (cleanup) cleanup()
        else setRef(ref, null)
      })
    }
  }
}
