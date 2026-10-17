import { describe, expect, it } from 'vitest'
import { docs } from '../lib/catalog'
import {
  type Control,
  deriveControls,
  fromParam,
  jsxAttributes,
  jsxElement,
  toParam,
} from './controls'
import { componentsByName, playgrounds } from './registry'

describe('playground registry', () => {
  it('only configures component pages that exist', () => {
    const slugs = new Set(docs.map((d) => d.slug))
    expect(Object.keys(playgrounds).filter((slug) => !slugs.has(slug))).toEqual([])
  })

  it('renders components that @glyphui/ui really exports', () => {
    const missing = Object.entries(playgrounds).flatMap(([slug, config]) => {
      const doc = docs.find((d) => d.slug === slug)
      const name = config.component ?? doc?.propsOf?.replace(/Props$/, '')
      return name && componentsByName[name] ? [] : [`${slug}: ${name ?? '(no component)'}`]
    })
    expect(missing).toEqual([])
  })
})

describe('accessibility data', () => {
  it('has keys and an action for every keyboard row', () => {
    const bad = docs.flatMap((doc) =>
      (doc.a11y?.keyboard ?? [])
        .filter((row) => !row.keys.trim() || !row.action.trim())
        .map(() => doc.slug),
    )
    expect(bad).toEqual([])
  })
})

describe('deriveControls', () => {
  const styles = {
    variants: {
      variant: { primary: '', outline: '' },
      size: { sm: '', md: '', lg: '' },
      fullWidth: { true: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }

  it('turns variants into enums and flags into booleans, with their defaults', () => {
    const controls = deriveControls([], styles)
    expect(controls).toEqual([
      { name: 'variant', kind: 'enum', options: ['primary', 'outline'], defaultValue: 'primary' },
      { name: 'size', kind: 'enum', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      { name: 'fullWidth', kind: 'boolean', defaultValue: false },
    ])
  })

  it('reads plain props and skips plumbing, handlers and complex types', () => {
    const controls = deriveControls([
      { name: 'loading', type: 'boolean', required: false },
      { name: 'label', type: 'ReactNode', required: false },
      { name: 'icon', type: 'ReactNode', required: false },
      { name: 'max', type: 'number', required: false },
      { name: 'tone', type: '"info" | "danger"', required: false },
      { name: 'asChild', type: 'boolean', required: false },
      { name: 'onValueChange', type: '(value: string) => void', required: false },
      { name: 'items', type: 'readonly Item[]', required: false },
      { name: 'aria-label', type: 'string', required: false },
    ])
    expect(controls.map((c) => [c.name, c.kind])).toEqual([
      ['loading', 'boolean'],
      ['label', 'text'],
      ['max', 'number'],
      ['tone', 'enum'],
    ])
  })
})

describe('generated code', () => {
  const controls: Control[] = [
    { name: 'children', kind: 'text' },
    { name: 'variant', kind: 'enum', options: ['primary', 'outline'], defaultValue: 'primary' },
    { name: 'disabled', kind: 'boolean', defaultValue: false },
    { name: 'max', kind: 'number' },
  ]

  it('leaves out default values', () => {
    expect(jsxAttributes(controls, { variant: 'primary', disabled: false })).toEqual([])
  })

  it('writes strings, booleans and numbers as JSX', () => {
    const attrs = jsxAttributes(controls, { variant: 'outline', disabled: true, max: 5 })
    expect(attrs).toEqual(['variant="outline"', 'disabled', 'max={5}'])
    expect(jsxElement('Button', attrs, 'Save')).toBe(
      '<Button variant="outline" disabled max={5}>Save</Button>',
    )
    expect(jsxElement('Spinner', [])).toBe('<Spinner />')
  })

  it('escapes quotes in text values', () => {
    expect(jsxAttributes(controls, { variant: 'say "hi"' })).toEqual(['variant={"say \\"hi\\""}'])
  })
})

describe('URL values', () => {
  it('round-trips every kind and drops defaults', () => {
    const bool: Control = { name: 'disabled', kind: 'boolean', defaultValue: false }
    const num: Control = { name: 'max', kind: 'number' }
    const en: Control = { name: 'size', kind: 'enum', options: ['sm', 'md'], defaultValue: 'md' }
    expect(fromParam(bool, toParam(bool, true))).toBe(true)
    expect(toParam(bool, false)).toBeNull()
    expect(fromParam(num, toParam(num, 12))).toBe(12)
    expect(fromParam(num, 'abc')).toBeUndefined()
    expect(fromParam(en, 'xl')).toBeUndefined()
    expect(toParam(en, 'md')).toBeNull()
  })
})
