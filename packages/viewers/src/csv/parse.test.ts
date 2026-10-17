import { describe, expect, it, vi } from 'vitest'
import { parseCsv } from './parse'

describe('parseCsv', () => {
  it('handles quotes, escaped quotes and newlines inside cells', async () => {
    const text = 'name,note\nAda,"Says ""hi"""\nGrace,"two\nlines"\nAlan,"a, b"\n'
    const { rows, delimiter, errors } = await parseCsv(text)
    expect(delimiter).toBe(',')
    expect(errors).toEqual([])
    expect(rows).toEqual([
      ['name', 'note'],
      ['Ada', 'Says "hi"'],
      ['Grace', 'two\nlines'],
      ['Alan', 'a, b'],
    ])
  })

  it('drops a byte-order mark so the first header is clean', async () => {
    const { rows } = await parseCsv('﻿id,name\n1,Ada')
    expect(rows[0]).toEqual(['id', 'name'])
  })

  it('detects semicolons and tabs, or uses the delimiter it is given', async () => {
    expect((await parseCsv('a;b\n1;2')).delimiter).toBe(';')
    expect((await parseCsv('a\tb\n1\t2')).delimiter).toBe('\t')
    expect((await parseCsv('a;b\n1;2', { delimiter: ',' })).rows[0]).toEqual(['a;b'])
  })

  it('reads Files', async () => {
    const file = new File(['x,y\n1,2'], 'data.csv', { type: 'text/csv' })
    expect((await parseCsv(file)).rows).toEqual([
      ['x', 'y'],
      ['1', '2'],
    ])
  })

  it('stops at maxRows and says so', async () => {
    const text = Array.from({ length: 50 }, (_, i) => `${i},row`).join('\n')
    const result = await parseCsv(text, { maxRows: 10 })
    expect(result.rows).toHaveLength(10)
    expect(result.truncated).toBe(true)
  })

  it('reports malformed rows with row numbers', async () => {
    const result = await parseCsv('a,b\n1,"unclosed\n2,3')
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]?.row).toBeGreaterThan(0)
    expect(result.errors[0]?.message).toMatch(/quote/i)
  })

  it('can be cancelled', async () => {
    const controller = new AbortController()
    controller.abort()
    const spy = vi.fn()
    await parseCsv('a,b\n1,2', { signal: controller.signal }).then(spy, (error) => {
      expect((error as Error).name).toBe('AbortError')
    })
  })
})
