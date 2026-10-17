export type JsonType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

export interface JsonNode {
  /** JSONPath, also the node's id: `$`, `$.invoices[0].total`, `$['odd key']`. */
  path: string
  /** Key in the parent object, or index in the parent array. `undefined` for the root. */
  key: string | number | undefined
  value: unknown
  type: JsonType
  depth: number
  /** Children's paths, for objects and arrays. */
  children: string[]
  parent: string | undefined
}

export interface JsonIndex {
  root: JsonNode
  nodes: Map<string, JsonNode>
}

export function jsonType(value: unknown): JsonType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  const t = typeof value
  if (t === 'string' || t === 'number' || t === 'boolean') return t
  return 'object'
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

/** Appends a key to a JSONPath: `.name` for identifiers, `['odd key']` otherwise. */
export function childPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`
  if (IDENTIFIER.test(key)) return `${parent}.${key}`
  return `${parent}['${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}']`
}

/** Indexes every node of a parsed JSON value by its path. */
export function indexJson(value: unknown): JsonIndex {
  const nodes = new Map<string, JsonNode>()
  const visit = (
    v: unknown,
    path: string,
    key: string | number | undefined,
    depth: number,
    parent: string | undefined,
  ): JsonNode => {
    const type = jsonType(v)
    const node: JsonNode = { path, key, value: v, type, depth, children: [], parent }
    nodes.set(path, node)
    if (type === 'array') {
      ;(v as unknown[]).forEach((item, i) => {
        node.children.push(visit(item, childPath(path, i), i, depth + 1, path).path)
      })
    } else if (type === 'object') {
      for (const [k, item] of Object.entries(v as Record<string, unknown>)) {
        node.children.push(visit(item, childPath(path, k), k, depth + 1, path).path)
      }
    }
    return node
  }
  const root = visit(value, '$', undefined, 0, undefined)
  return { root, nodes }
}

/** Paths of every container at or above `depth`, i.e. what "expand to depth" opens. */
export function expandedToDepth(index: JsonIndex, depth: number): Set<string> {
  const open = new Set<string>()
  for (const node of index.nodes.values()) {
    if (node.children.length > 0 && node.depth < depth) open.add(node.path)
  }
  return open
}

/** The visible rows, in order, for the current set of expanded containers. */
export function flattenVisible(index: JsonIndex, expanded: ReadonlySet<string>): JsonNode[] {
  const rows: JsonNode[] = []
  const stack: JsonNode[] = [index.root]
  while (stack.length > 0) {
    const node = stack.pop() as JsonNode
    rows.push(node)
    if (expanded.has(node.path)) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(index.nodes.get(node.children[i] as string) as JsonNode)
      }
    }
  }
  return rows
}

/** Every ancestor path of a node, root first. */
export function ancestors(index: JsonIndex, path: string): string[] {
  const out: string[] = []
  let current = index.nodes.get(path)?.parent
  while (current) {
    out.unshift(current)
    current = index.nodes.get(current)?.parent
  }
  return out
}

/** Paths whose key or primitive value contains `query` (case-insensitive), in document order. */
export function searchJson(index: JsonIndex, query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: string[] = []
  const walk = (node: JsonNode) => {
    const keyHit = node.key !== undefined && String(node.key).toLowerCase().includes(q)
    const valueHit =
      node.children.length === 0 &&
      node.type !== 'object' &&
      node.type !== 'array' &&
      String(node.value).toLowerCase().includes(q)
    if (keyHit || valueHit) hits.push(node.path)
    for (const child of node.children) walk(index.nodes.get(child) as JsonNode)
  }
  walk(index.root)
  return hits
}

export interface JsonParseError {
  message: string
  line?: number
  column?: number
}

/** Parses JSON, turning V8/SpiderMonkey/JSC errors into a line and column when possible. */
export function parseJson(
  text: string,
): { ok: true; value: unknown } | { ok: false; error: JsonParseError } {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (cause) {
    const raw = cause instanceof Error ? cause.message : String(cause)
    // Engines append the position in different forms; it's reported separately as line/column.
    const message = raw
      .replace(/\s*\(line \d+ column \d+\)/i, '')
      .replace(/\s+(?:in JSON\s+)?at position \d+/i, '')
      .trim()
    const lineCol = /line (\d+) column (\d+)/i.exec(raw)
    if (lineCol) {
      return { ok: false, error: { message, line: Number(lineCol[1]), column: Number(lineCol[2]) } }
    }
    const position = /position (\d+)/i.exec(raw)
    if (position) {
      const offset = Number(position[1])
      const before = text.slice(0, offset).split('\n')
      return {
        ok: false,
        error: { message, line: before.length, column: (before.at(-1)?.length ?? 0) + 1 },
      }
    }
    return { ok: false, error: { message } }
  }
}

/** A one-line preview of a container: `{ 3 keys }`, `[ 12 items ]`. */
export function summary(node: JsonNode): string {
  const n = node.children.length
  if (node.type === 'array') return `[ ${n} ${n === 1 ? 'item' : 'items'} ]`
  if (node.type === 'object') return `{ ${n} ${n === 1 ? 'key' : 'keys'} }`
  return ''
}

/** A primitive as it appears in JSON. */
export function formatPrimitive(node: JsonNode): string {
  if (node.type === 'string') return JSON.stringify(node.value)
  return String(node.value)
}
