import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useControllableState } from './use-controllable-state'

describe('useControllableState', () => {
  it('applies consecutive functional updates in the same tick', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState({ defaultValue: 0, onChange }))
    act(() => {
      result.current[1]((n) => n + 1)
      result.current[1]((n) => n + 1)
    })
    expect(result.current[0]).toBe(2)
    expect(onChange.mock.calls).toEqual([[1], [2]])
  })

  it('passes the latest controlled value to functional updates', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 0, onChange }),
      { initialProps: { value: 5 } },
    )
    rerender({ value: 7 })
    act(() => result.current[1]((n) => n * 2))
    expect(onChange).toHaveBeenLastCalledWith(14)
    expect(result.current[0]).toBe(7)
  })

  it('keeps the setter stable across renders', () => {
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: 'a' }))
    const first = result.current[1]
    act(() => result.current[1]('b'))
    rerender()
    expect(result.current[1]).toBe(first)
  })
})
