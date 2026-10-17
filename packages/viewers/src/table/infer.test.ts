import { describe, expect, it } from 'vitest'
import { buildTable, coerce, columnLetter, inferColumnType, looksLikeHeader } from './infer'

describe('inferColumnType', () => {
  it('detects numbers, including thousands separators and exponents', () => {
    expect(inferColumnType(['1', '2,500', '-3.75', '1e3'])).toBe('number')
    expect(inferColumnType([1, 2.5, null])).toBe('number')
  })

  it('detects ISO dates and Date values', () => {
    expect(inferColumnType(['2026-01-01', '2026-10-17T09:41:00Z'])).toBe('date')
    expect(inferColumnType([new Date(), new Date()])).toBe('date')
  })

  it('detects booleans written as words', () => {
    expect(inferColumnType(['true', 'FALSE', 'yes', 'No'])).toBe('boolean')
    expect(inferColumnType([true, false])).toBe('boolean')
  })

  it('tolerates a stray value but not many', () => {
    const mostly = [...Array.from({ length: 40 }, (_, i) => String(i)), 'n/a']
    expect(inferColumnType(mostly)).toBe('number')
    expect(inferColumnType(['1', '2', 'three', 'four'])).toBe('text')
  })

  it('ignores empty values and defaults to text', () => {
    expect(inferColumnType(['', null, undefined, ' 4 '])).toBe('number')
    expect(inferColumnType([])).toBe('text')
  })
})

describe('coerce', () => {
  it('converts to the column type, or null when it cannot', () => {
    expect(coerce('2,500.5', 'number')).toBe(2500.5)
    expect(coerce('abc', 'number')).toBeNull()
    expect(coerce('Yes', 'boolean')).toBe(true)
    expect(coerce('no', 'boolean')).toBe(false)
    expect(coerce(new Date(Date.UTC(2026, 9, 17)), 'date')).toBe('2026-10-17')
    expect(coerce(new Date(Date.UTC(2026, 9, 17, 9, 30)), 'date')).toBe('2026-10-17T09:30:00.000Z')
    expect(coerce('not a date', 'date')).toBeNull()
    expect(coerce('  ', 'text')).toBeNull()
    expect(coerce(42, 'text')).toBe('42')
  })
})

describe('looksLikeHeader', () => {
  it('accepts distinct, filled, non-data first rows', () => {
    expect(
      looksLikeHeader([
        ['id', 'name'],
        ['1', 'Ada'],
      ]),
    ).toBe(true)
    expect(
      looksLikeHeader([
        ['1', 'Ada'],
        ['2', 'Grace'],
      ]),
    ).toBe(false)
    expect(looksLikeHeader([['name', 'name']])).toBe(false)
    expect(looksLikeHeader([['name', '']])).toBe(false)
    expect(looksLikeHeader([])).toBe(false)
  })
})

describe('buildTable', () => {
  const grid = [
    ['order_id', 'region', 'total', 'paid', 'due'],
    ['1001', 'EU', '12.5', 'true', '2026-01-02'],
    ['1002', 'US', '7', 'false', '2026-01-03'],
    ['1003', 'EU', '', 'true', '2026-01-04'],
    ['1004', 'US', '3', 'false', '2026-01-05'],
    ['1005', 'EU', '9', 'true', '2026-01-06'],
  ]

  it('types columns and rows, with ids as identifiers and repeating text as options', () => {
    const { columns, rows } = buildTable(grid, true)
    expect(columns.map((c) => [c.label, c.type])).toEqual([
      ['order_id', 'number'],
      ['region', 'text'],
      ['total', 'number'],
      ['paid', 'boolean'],
      ['due', 'date'],
    ])
    expect(columns[0]?.identifier).toBe(true)
    expect(columns[2]?.identifier).toBeUndefined()
    expect(columns[1]?.options).toEqual(['EU', 'US'])
    expect(rows[0]).toMatchObject({ c0: 1001, c1: 'EU', c2: 12.5, c3: true, c4: '2026-01-02' })
    expect(rows[2]?.c2).toBeNull()
  })

  it('names columns A, B, C without a header and pads short rows', () => {
    const { columns, rows } = buildTable([['1', 'x'], ['2']], false)
    expect(columns.map((c) => c.label)).toEqual(['A', 'B'])
    expect(rows).toHaveLength(2)
    expect(rows[1]?.c1).toBeNull()
  })
})

it('columnLetter counts like a spreadsheet', () => {
  expect([0, 25, 26, 27, 701, 702].map(columnLetter)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ', 'AAA'])
})
