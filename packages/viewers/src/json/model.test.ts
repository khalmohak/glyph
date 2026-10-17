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
})
