import type { ComponentType } from 'react'
import { roadmap } from '../content/roadmap'
import { type Category, categories, type DocMeta, type Status } from './doc'

const metas = import.meta.glob<DocMeta>('../content/*/meta.ts', { eager: true, import: 'default' })
const examples = import.meta.glob<{ default: ComponentType }>('../content/*/examples/*.tsx')

const byName = (a: DocMeta, b: DocMeta) => a.name.localeCompare(b.name)

/** Built components with a docs page. */
export const docs: DocMeta[] = Object.values(metas).sort(byName)

/** Everything tracked: built and planned. */
export const catalog: DocMeta[] = [
  ...docs,
  ...roadmap.filter((r) => !docs.some((d) => d.slug === r.slug)),
].sort(byName)

export function getDoc(slug: string): DocMeta | undefined {
  return catalog.find((doc) => doc.slug === slug)
}

export function docsByCategory(list: DocMeta[] = docs): { category: Category; items: DocMeta[] }[] {
  return categories
    .map((category) => ({ category, items: list.filter((doc) => doc.category === category) }))
    .filter((group) => group.items.length > 0)
}

export function countByStatus(): Record<Status, number> {
  const counts: Record<Status, number> = { stable: 0, beta: 0, planned: 0 }
  for (const doc of catalog) counts[doc.status]++
  return counts
}

/** Lazy loader for an example component. */
export function exampleLoader(slug: string, file: string) {
  const load = examples[`../content/${slug}/examples/${file}.tsx`]
  if (!load) throw new Error(`Missing example ${slug}/${file}.tsx`)
  return load
}
