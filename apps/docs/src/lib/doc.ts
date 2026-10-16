/**
 * The component catalog schema. Every component has a folder in `src/content/<slug>/`
 * with a `meta.ts` (default export of `defineDoc(...)`) and an `examples/` folder.
 * Each example is a real `.tsx` file whose default export renders the example; the docs
 * show its source verbatim, so examples are type-checked and never drift from the code.
 */

export const categories = [
  'Actions',
  'Forms',
  'Overlays',
  'Navigation',
  'Feedback',
  'Data display',
  'Typography',
  'Layout',
  'Patterns',
] as const

export type Category = (typeof categories)[number]

/**
 * stable: API settled, tested, documented.
 * beta: usable, API may still change.
 * planned: on the roadmap, not built yet.
 */
export type Status = 'stable' | 'beta' | 'planned'

export type Entry = '@glyphui/ui' | '@glyphui/ui/form' | '@glyphui/ui/data-table'

export interface ExampleMeta {
  /** File name in `examples/` without `.tsx`. */
  file: string
  title: string
  description?: string
}

export interface DocMeta {
  name: string
  /** URL segment and folder name, kebab-case. */
  slug: string
  category: Category
  status: Status
  /** One sentence: what it is and when to use it. */
  description: string
  /** Where it is imported from. */
  entry?: Entry
  /** Every runtime export this doc covers. Checked against the package's real exports. */
  exports?: readonly string[]
  /** Source file (relative to `packages/ui/src/`) whose props are documented. */
  source?: string
  /** Component export whose props are documented, e.g. `Button`. */
  propsOf?: string
  /** Link to the Radix primitive it builds on. */
  radix?: string
  examples?: readonly ExampleMeta[]
  /** Usage and accessibility notes, one sentence each. */
  notes?: readonly string[]
}

export function defineDoc<const T extends DocMeta>(meta: T): T {
  return meta
}
