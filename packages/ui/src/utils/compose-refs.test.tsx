import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { composeRefs } from './compose-refs'

describe('composeRefs', () => {
  it('sets every ref and clears them on unmount, running callback-ref cleanups', () => {
    const object = createRef<HTMLDivElement>()
    const cleanup = vi.fn()
    const callback = vi.fn(() => cleanup)
    const plain = vi.fn()
    const { unmount } = render(<div ref={composeRefs(object, callback, plain)} />)
    expect(object.current).toBeInstanceOf(HTMLDivElement)
    expect(callback).toHaveBeenCalledWith(object.current)
    unmount()
    expect(object.current).toBeNull()
    // React 19: a callback ref that returns a cleanup gets the cleanup, not a null call.
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(plain).toHaveBeenLastCalledWith(null)
  })
})
