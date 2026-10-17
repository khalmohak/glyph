import allProps from 'virtual:glyph-props'
import { findStyles } from '../components/theming-info'
import type { DocMeta } from '../lib/doc'
import { type Control, deriveControls } from './controls'
import {
  type AnyComponent,
  componentsByName,
  type PlaygroundConfig,
  type PlaygroundValues,
  playgrounds,
} from './registry'

export interface ResolvedPlayground {
  /** Export name shown in code, e.g. `Button`. */
  name: string
  Component: AnyComponent
  controls: Control[]
  config: PlaygroundConfig
  /** Values the playground starts with (and resets to). */
  initial: PlaygroundValues
}

const isComponent = (value: unknown): value is AnyComponent =>
  typeof value === 'function' ||
  (typeof value === 'object' && value !== null && '$$typeof' in value)

function applyConfig(derived: Control[], config: PlaygroundConfig): Control[] {
  let controls = derived
  if (config.include) {
    const order = config.include
    controls = controls
      .filter((c) => order.includes(c.name))
      .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
  }
  if (config.exclude) controls = controls.filter((c) => !config.exclude?.includes(c.name))
  const added: Control[] = []
  for (const extra of config.controls ?? []) {
    const index = controls.findIndex((c) => c.name === extra.name)
    if (index >= 0) controls[index] = { ...controls[index]!, ...extra } as Control
    else if (!config.include || config.include.includes(extra.name))
      added.push({ kind: 'string', ...extra } as Control)
  }
  // Text controls (children, title, label) read best first, then the derived ones.
  const all = [
    ...added.filter((c) => c.kind === 'text'),
    ...controls,
    ...added.filter((c) => c.kind !== 'text'),
  ]
  const order = config.include
  return order ? all.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name)) : all
}

/**
 * The Playground for a component page, or `null` when it has none. Only components with a
 * config in the registry get one: generated-only previews of compound or data-driven
 * components (menus, lists, prose) render empty or need context, which teaches nothing.
 */
export function playgroundFor(doc: DocMeta): ResolvedPlayground | null {
  if (doc.status === 'planned') return null
  const config = playgrounds[doc.slug]
  if (!config) return null
  const name = config.component ?? doc.propsOf?.replace(/Props$/, '')
  if (!name) return null
  const Component = componentsByName[name]
  if (!isComponent(Component)) return null

  const derived = deriveControls(allProps[name] ?? [], findStyles(name))
  const controls = applyConfig(derived, config)
  if (controls.length === 0) return null
  const initial: PlaygroundValues = {}
  for (const control of controls) {
    const value = config.initial?.[control.name] ?? control.initial ?? control.defaultValue
    if (value !== undefined) initial[control.name] = value
  }
  for (const [key, value] of Object.entries(config.initial ?? {}))
    if (!(key in initial)) initial[key] = value
  return { name, Component, controls, config, initial }
}
