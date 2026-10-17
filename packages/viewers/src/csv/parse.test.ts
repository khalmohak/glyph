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

  it('reads Excel CSV files in Windows-1252 and UTF-16', async () => {
    const text = 'name,city\nRené,Zürich'
    const latin = Uint8Array.from(text, (c) => c.charCodeAt(0))
    expect((await parseCsv(new File([latin], 'excel.csv'))).rows[1]).toEqual(['René', 'Zürich'])

    const utf16 = new Uint8Array(2 + text.length * 2)
    utf16.set([0xff, 0xfe])
    for (let i = 0; i < text.length; i++) utf16[2 + i * 2] = text.charCodeAt(i)
    expect((await parseCsv(new Blob([utf16]))).rows).toEqual([
      ['name', 'city'],
      ['René', 'Zürich'],
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
