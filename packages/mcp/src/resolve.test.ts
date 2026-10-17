import { describe, expect, it } from 'vitest'
import { distance, findComponent, findGuide, suggestComponents } from './resolve'
import { fixture } from './test/fixture'

describe('distance', () => {
  it('counts single-character edits', () => {
    expect(distance('button', 'button')).toBe(0)
    expect(distance('buton', 'button')).toBe(1)
    expect(distance('kitten', 'sitting')).toBe(3)
    expect(distance('', 'abc')).toBe(3)
  })
})

describe('findComponent', () => {
  it('matches the name, slug or an export, ignoring case and punctuation', () => {
    expect(findComponent(fixture, 'Button')?.name).toBe('Button')
    expect(findComponent(fixture, 'button')?.name).toBe('Button')
    expect(findComponent(fixture, 'data-table')?.name).toBe('DataTable')
    expect(findComponent(fixture, 'Data Table')?.name).toBe('DataTable')
    expect(findComponent(fixture, 'IconButton')?.name).toBe('Button')
    expect(findComponent(fixture, 'useDataTable')?.name).toBe('DataTable')
  })

  it('prefers a name over an export of another component', () => {
    const m = {
      ...fixture,
      components: [
        { ...fixture.components[1]!, exports: ['DataTable', 'Button'] },
        ...fixture.components,
      ],
    }
    expect(findComponent(m, 'Button')?.name).toBe('Button')
  })

  it('returns nothing for empty or unknown names', () => {
    expect(findComponent(fixture, '')).toBeUndefined()
    expect(findComponent(fixture, '--')).toBeUndefined()
    expect(findComponent(fixture, 'Spaceship')).toBeUndefined()
  })
})

describe('suggestComponents', () => {
  it('suggests close names for typos', () => {
    expect(suggestComponents(fixture, 'Buton')).toEqual(['Button'])
    expect(suggestComponents(fixture, 'datatabel')[0]).toBe('DataTable')
  })

  it('suggests components a partial name is part of', () => {
    expect(suggestComponents(fixture, 'hero')).toContain('HeroSection')
  })

  it('suggests nothing for unrelated words', () => {
    expect(suggestComponents(fixture, 'zzzzzzzz')).toEqual([])
  })
})

describe('findGuide', () => {
  it('matches the slug or title', () => {
    expect(findGuide(fixture, 'data-tables')?.slug).toBe('data-tables')
    expect(findGuide(fixture, 'Data tables')?.slug).toBe('data-tables')
    expect(findGuide(fixture, 'routing')).toBeUndefined()
  })
})
