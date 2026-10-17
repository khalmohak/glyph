import { describe, expect, it } from 'vitest'
import { deepMerge } from './merge'

describe('deepMerge', () => {
  it('replaces arrays and ignores undefined', () => {
    expect(deepMerge({ a: [1, 2], b: 1 }, { a: [3], b: undefined })).toEqual({ a: [3], b: 1 })
  })

  it('ignores prototype keys from parsed JSON', () => {
    const override = JSON.parse(
      '{"__proto__": {"polluted": true}, "constructor": {"x": 1}, "a": 2}',
    )
    const merged = deepMerge<Record<string, unknown>>({ a: 1 }, override)
    expect(merged.a).toBe(2)
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype)
    expect(merged.polluted).toBeUndefined()
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.hasOwn(merged, 'constructor')).toBe(false)
  })
})
