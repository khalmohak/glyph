import type { PropDoc } from '../../plugins/docs-data'

/**
 * Playground controls, derived from two build-time sources:
 * - the component's `tv()` styles: variants (`size`, `tone`, …) and their defaults;
 * - its extracted props: booleans, strings, numbers and string-literal unions.
 * Anything that can't be edited as a plain value (functions, objects, arrays, icons) is left
 * out; a playground config can add or override controls.
 */
export type ControlKind = 'enum' | 'boolean' | 'string' | 'number' | 'text'

export interface Control {
  name: string
  kind: ControlKind
  options?: readonly string[]
  /** The component's own default; values equal to it are left out of the generated code. */
  defaultValue?: unknown
  /** Initial value in the playground, when it differs from the default (e.g. children text). */
  initial?: unknown
  min?: number
  max?: number
  step?: number
  /** Short help shown under the control. */
  description?: string
}

export interface StylesLike {
  variants?: Record<string, Record<string, unknown>>
  defaultVariants?: Record<string, unknown>
}

/** Props never offered as controls: plumbing, styling escape hatches and ARIA wiring. */
const SKIP = new Set([
  'asChild',
  'className',
  'contentClassName',
  'inputClassName',
  'style',
  'ref',
  'key',
  'id',
  'name',
  'value',
  'defaultValue',
  'checked',
  'defaultChecked',
  'open',
  'defaultOpen',
  'form',
])

/** ReactNode props that read naturally as a line of text. */
const TEXT_PROPS = new Set([
  'children',
  'title',
  'description',
  'label',
  'placeholder',
  'eyebrow',
  'footnote',
  'delta',
  'value',
])

const unionOf = (type: string): string[] | null => {
  const parts = type.split('|').map((p) => p.trim())
  if (parts.length < 2) return null
  const literals = parts.map((p) => p.match(/^"([^"]*)"$|^'([^']*)'$/))
  if (literals.some((m) => !m)) return null
  return literals.map((m) => (m![1] ?? m![2]) as string)
}

function parseDefault(raw: string | undefined): unknown {
  if (raw === undefined || raw === '') return undefined
  if (raw === 'true' || raw === 'false') return raw === 'true'
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  const quoted = raw.match(/^['"`](.*)['"`]$/)
  return quoted ? quoted[1] : undefined
}

export function deriveControls(props: readonly PropDoc[], styles?: StylesLike): Control[] {
  const controls = new Map<string, Control>()
  const defaults = styles?.defaultVariants ?? {}

  for (const [name, values] of Object.entries(styles?.variants ?? {})) {
    const keys = Object.keys(values)
    if (keys.length === 0 || SKIP.has(name)) continue
    if (keys.every((k) => k === 'true' || k === 'false')) {
      controls.set(name, { name, kind: 'boolean', defaultValue: defaults[name] === true })
    } else {
      controls.set(name, { name, kind: 'enum', options: keys, defaultValue: defaults[name] })
    }
  }

  for (const prop of props) {
    if (controls.has(prop.name) || SKIP.has(prop.name) || prop.name.startsWith('aria-')) continue
    if (prop.name.startsWith('on') && /^on[A-Z]/.test(prop.name)) continue
    const type = prop.type.replace(/\s+/g, ' ').trim()
    const defaultValue = parseDefault(prop.defaultValue)
    const base = { name: prop.name, ...(prop.description && { description: prop.description }) }
    const literals = unionOf(type)
    if (literals)
      controls.set(prop.name, { ...base, kind: 'enum', options: literals, defaultValue })
    else if (type === 'boolean')
      controls.set(prop.name, { ...base, kind: 'boolean', defaultValue: defaultValue ?? false })
    else if (type === 'string') controls.set(prop.name, { ...base, kind: 'string', defaultValue })
    else if (type === 'number' || type === 'number | null')
      controls.set(prop.name, { ...base, kind: 'number', defaultValue })
    else if (type === 'ReactNode' && TEXT_PROPS.has(prop.name))
      controls.set(prop.name, { ...base, kind: 'text', defaultValue })
  }
  return [...controls.values()]
}

/** Reads a control value from a URL search param. */
export function fromParam(control: Control, raw: string | null): unknown {
  if (raw === null) return undefined
  switch (control.kind) {
    case 'boolean':
      return raw === '1' || raw === 'true'
    case 'number': {
      const n = Number(raw)
      return raw === '' || Number.isNaN(n) ? undefined : n
    }
    case 'enum':
      return control.options?.includes(raw) ? raw : undefined
    default:
      return raw
  }
}

/** Writes a control value to a URL search param; `null` removes it. */
export function toParam(control: Control, value: unknown): string | null {
  if (value === undefined || value === null || value === control.defaultValue) return null
  if (control.kind === 'boolean') return value ? '1' : '0'
  return String(value)
}

const attr = (name: string, value: unknown): string | null => {
  if (value === undefined || value === null || value === '') return null
  if (value === true) return name
  if (value === false) return `${name}={false}`
  if (typeof value === 'number') return `${name}={${value}}`
  const text = String(value)
  return text.includes('"') || text.includes('\n')
    ? `${name}={${JSON.stringify(text)}}`
    : `${name}="${text}"`
}

/** The attributes that differ from the component's defaults, as JSX source. */
export function jsxAttributes(
  controls: readonly Control[],
  values: Readonly<Record<string, unknown>>,
): string[] {
  const out: string[] = []
  for (const control of controls) {
    if (control.name === 'children') continue
    const value = values[control.name]
    const fallback = control.defaultValue ?? (control.kind === 'boolean' ? false : undefined)
    if (value === undefined || value === fallback) continue
    const rendered = attr(control.name, value)
    if (rendered) out.push(rendered)
  }
  return out
}

/** `<Button size="lg" disabled>Save</Button>`, wrapped onto lines when it gets long. */
export function jsxElement(name: string, attrs: readonly string[], children?: string): string {
  const inline = [name, ...attrs].join(' ')
  const open = inline.length > 64 ? `${name}\n  ${attrs.join('\n  ')}\n` : inline
  if (children === undefined || children === '')
    return `<${open}${open.endsWith('\n') ? '' : ' '}/>`
  return `<${open}>${children}</${name}>`
}
