import type { Row } from '@tanstack/react-table'
import { describe, expect, it } from 'vitest'
import { filterFnFor, isActiveFilter, toDay, toList, withFilterFns } from './filter-fns'

const row = (value: unknown) => ({ getValue: () => value }) as unknown as Row<unknown>
const run = (type: Parameters<typeof filterFnFor>[0], cell: unknown, value: unknown) =>
  filterFnFor(type)(row(cell), 'col', value, () => {})

describe('filter functions', () => {
  it('select matches one value', () => {
    const config = { type: 'select', options: [] } as const
    expect(run(config, 'paid', 'paid')).toBe(true)
    expect(run(config, 'open', 'paid')).toBe(false)
    expect(run(config, 'open', '')).toBe(true)
  })

  it('multi matches any value, and array cells by overlap', () => {
    const config = { type: 'multi', options: [] } as const
    expect(run(config, 'paid', ['paid', 'open'])).toBe(true)
    expect(run(config, 'draft', ['paid', 'open'])).toBe(false)
    expect(run(config, 'paid', 'paid')).toBe(true)
    expect(run(config, ['vip', 'eu'], ['eu'])).toBe(true)
  })

  it('range is inclusive and open-ended', () => {
    const config = { type: 'range' } as const
    expect(run(config, 100, { min: 100, max: 200 })).toBe(true)
    expect(run(config, 99, { min: 100 })).toBe(false)
    expect(run(config, 1e9, { min: 100 })).toBe(true)
    expect(run(config, '250', { max: 200 })).toBe(false)
    expect(run(config, null, { min: 1 })).toBe(false)
  })

  it('date-range compares whole local days', () => {
    const config = { type: 'date-range' } as const
    const value = { from: '2026-03-01', to: '2026-03-31' }
    expect(run(config, new Date(2026, 2, 31, 23, 59), value)).toBe(true)
    expect(run(config, new Date(2026, 3, 1), value)).toBe(false)
    expect(run(config, '2026-03-15', value)).toBe(true)
    expect(run(config, 'not a date', value)).toBe(false)
    expect(run(config, new Date(2026, 0, 1), {})).toBe(true)
  })

  it('text matches case-insensitively', () => {
    const config = { type: 'text' } as const
    expect(run(config, 'Northwind Traders', 'north')).toBe(true)
    expect(run(config, 'Globex', 'north')).toBe(false)
  })

  it('removes empty values automatically', () => {
    expect(filterFnFor({ type: 'multi', options: [] }).autoRemove?.([])).toBe(true)
    expect(filterFnFor({ type: 'range' }).autoRemove?.({})).toBe(true)
    expect(filterFnFor({ type: 'text' }).autoRemove?.('x')).toBe(false)
  })
})

describe('helpers', () => {
  it('normalizes values', () => {
    expect(toList('a')).toEqual(['a'])
    expect(toList(undefined)).toEqual([])
    expect(toDay(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDay('2026-01-05')).toBe('2026-01-05')
    expect(toDay(new Date('invalid'))).toBeUndefined()
    expect(isActiveFilter('date-range', { from: '2026-01-01' })).toBe(true)
    expect(isActiveFilter('select', '')).toBe(false)
  })

  it('adds filter functions to columns with meta.filter, nested groups included', () => {
    const columns = [
      { accessorKey: 'a', meta: { filter: { type: 'text' as const } } },
      {
        header: 'Group',
        columns: [{ accessorKey: 'b', meta: { filter: { type: 'range' as const } } }],
      },
      { accessorKey: 'c' },
    ]
    const result = withFilterFns(columns)
    expect(result[0]).toHaveProperty('filterFn')
    expect((result[1] as { columns: unknown[] }).columns[0]).toHaveProperty('filterFn')
    expect(result[2]).toBe(columns[2])
    expect(withFilterFns([columns[2]!])).toEqual([columns[2]])
  })
})
