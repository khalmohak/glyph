import { describe, expect, it } from 'vitest'
import {
  ancestors,
  childPath,
  expandedToDepth,
  flattenVisible,
  formatPrimitive,
  indexJson,
  parseJson,
  searchJson,
  summary,
} from './model'

const doc = {
  user: { name: 'Ada', 'first-name': 'Ada', tags: ['admin', 'ops'] },
  count: 2,
  ok: null,
}

describe('JSON model', () => {
  it('builds JSONPaths, quoting keys that are not identifiers', () => {
    expect(childPath('$', 'user')).toBe('$.user')
    expect(childPath('$.user', 'first-name')).toBe("$.user['first-name']")
    expect(childPath('$', "it's")).toBe("$['it\\'s']")
    expect(childPath('$.tags', 0)).toBe('$.tags[0]')
  })

  it('indexes every node with type, depth and children', () => {
    const index = indexJson(doc)
    expect(index.nodes.size).toBe(9)
    expect(index.nodes.get('$.user.tags[1]')).toMatchObject({
      value: 'ops',
      type: 'string',
      depth: 3,
    })
    expect(index.nodes.get('$.ok')?.type).toBe('null')
    expect(summary(index.nodes.get('$.user') as never)).toBe('{ 3 keys }')
    expect(summary(index.nodes.get('$.user.tags') as never)).toBe('[ 2 items ]')
    expect(formatPrimitive(index.nodes.get('$.user.name') as never)).toBe('"Ada"')
  })

  it('flattens only expanded containers, in document order', () => {
    const index = indexJson(doc)
    const rows = flattenVisible(index, expandedToDepth(index, 1)).map((n) => n.path)
    expect(rows).toEqual(['$', '$.user', '$.count', '$.ok'])
    const all = flattenVisible(index, expandedToDepth(index, Number.POSITIVE_INFINITY))
    expect(all).toHaveLength(9)
  })

  it('searches keys and values and finds ancestors to reveal', () => {
    const index = indexJson(doc)
    expect(searchJson(index, 'ADA')).toEqual(['$.user.name', "$.user['first-name']"])
    expect(searchJson(index, 'tags')).toEqual(['$.user.tags'])
    expect(searchJson(index, '  ')).toEqual([])
    expect(ancestors(index, '$.user.tags[0]')).toEqual(['$', '$.user', '$.user.tags'])
  })

  it('reports parse errors with a line and column', () => {
    const result = parseJson('{\n  "a": 1,\n}')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.line).toBe(3)
      expect(result.error.message).not.toMatch(/position|line \d+ column/i)
    }
    expect(parseJson('[1,2]')).toEqual({ ok: true, value: [1, 2] })
  })

  it('shows in-memory data the way JSON.stringify would', () => {
    const when = new Date('2026-10-17T09:00:00Z')
    const index = indexJson({
      gone: undefined,
      fn: () => 1,
      when,
      big: 12n,
      list: [undefined, 1],
    })
    expect(index.root.children).toEqual(['$.when', '$.big', '$.list'])
    expect(formatPrimitive(index.nodes.get('$.when')!)).toBe('"2026-10-17T09:00:00.000Z"')
    expect(formatPrimitive(index.nodes.get('$.big')!)).toBe('12')
    expect(index.nodes.get('$.list[0]')?.type).toBe('null')
  })

  it('marks circular references instead of recursing forever', () => {
    const user: Record<string, unknown> = { name: 'Ada' }
    user.self = user
    const index = indexJson({ user })
    const self = index.nodes.get('$.user.self')!
    expect(self.circular).toBe(true)
    expect(self.children).toEqual([])
    expect(summary(self)).toBe('[Circular]')
  })

  it('indexes very deep documents without overflowing the stack', () => {
    let deep: unknown = 1
    for (let i = 0; i < 20_000; i++) deep = [deep]
    const index = indexJson(deep)
    expect(index.nodes.size).toBe(20_001)
  })
})
