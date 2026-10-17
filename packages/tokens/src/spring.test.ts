import { describe, expect, it } from 'vitest'
import { brutalist, editorial, glyph, playful } from './presets'
import { springEasing, springPosition } from './spring'

const values = (easing: string) =>
  easing
    .replace(/^linear\(|\)$/g, '')
    .split(',')
    .map(Number)

describe('springEasing', () => {
  it('starts at 0 and ends at 1', () => {
    for (const theme of [glyph, brutalist, editorial, playful]) {
      const v = values(springEasing(theme.motion.spring!).easing)
      expect(v[0]).toBe(0)
      expect(v.at(-1)).toBe(1)
    }
  })

  it('is monotonic and never overshoots for critically and over-damped springs', () => {
    for (const spring of [
      { stiffness: 900, damping: 60 },
      { stiffness: 200, damping: 60 },
    ]) {
      const v = values(springEasing(spring).easing)
      for (let i = 1; i < v.length; i++) expect(v[i]!).toBeGreaterThanOrEqual(v[i - 1]!)
      expect(Math.max(...v)).toBeLessThanOrEqual(1)
    }
  })

  it('overshoots only when underdamped', () => {
    expect(
      Math.max(...values(springEasing({ stiffness: 380, damping: 18 }).easing)),
    ).toBeGreaterThan(1.05)
    expect(
      Math.max(...values(springEasing({ stiffness: 260, damping: 32.3 }).easing)),
    ).toBeLessThanOrEqual(1)
  })

  it('settles faster for stiffer springs and stays within its cap', () => {
    const stiff = springEasing({ stiffness: 900, damping: 60 }).duration
    const soft = springEasing({ stiffness: 120, damping: 22 }).duration
    expect(stiff).toBeLessThan(soft)
    expect(springEasing({ stiffness: 10, damping: 1 }).duration).toBe(1200)
  })

  it('matches the closed-form spring at the start and the end', () => {
    expect(springPosition({ stiffness: 420, damping: 34 }, 0)).toBeCloseTo(0)
    expect(springPosition({ stiffness: 420, damping: 34 }, 2)).toBeCloseTo(1)
  })

  it.each([
    { stiffness: 0, damping: 10 },
    { stiffness: 300, damping: 20, mass: 0 },
    { stiffness: -5, damping: 10 },
    { stiffness: Number.NaN, damping: 10 },
    { stiffness: 300, damping: -1 },
  ])('falls back to a valid easing for an unusable spring %o', (spring) => {
    const { easing, duration } = springEasing(spring)
    expect(easing).not.toContain('NaN')
    expect(easing).not.toContain('Infinity')
    expect(Number.isFinite(duration)).toBe(true)
    expect(duration).toBeGreaterThan(0)
  })
})
