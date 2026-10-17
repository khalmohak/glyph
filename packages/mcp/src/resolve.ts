import type { Manifest, ManifestComponent, ManifestGuide } from './manifest'

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Edit distance, for "did you mean" suggestions. */
export function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0] as number
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const current = row[j] as number
      row[j] = Math.min(
        (row[j] as number) + 1,
        (row[j - 1] as number) + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      previous = current
    }
  }
  return row[b.length] as number
}

/**
 * Finds a component by name, slug or any export it covers, ignoring case and punctuation:
 * `Button`, `button`, `IconButton`, `data-table`, `DataTable`, `useConfirm`.
 */
export function findComponent(manifest: Manifest, query: string): ManifestComponent | undefined {
  const key = normalize(query)
  if (!key) return undefined
  return (
    manifest.components.find((c) => normalize(c.name) === key || normalize(c.slug) === key) ??
    manifest.components.find((c) => c.exports.some((e) => normalize(e) === key))
  )
}

/** Up to `limit` component names closest to a query that matched nothing. */
export function suggestComponents(manifest: Manifest, query: string, limit = 5): string[] {
  const key = normalize(query)
  return manifest.components
    .map((c) => {
      const names = [c.name, c.slug, ...c.exports].map(normalize)
      const best = Math.min(
        ...names.map((n) => (n.includes(key) || key.includes(n) ? 0 : distance(key, n))),
      )
      return { name: c.name, best }
    })
    .filter((s) => s.best <= Math.max(2, Math.floor(key.length / 3)))
    .sort((a, b) => a.best - b.best || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((s) => s.name)
}

export function findGuide(manifest: Manifest, query: string): ManifestGuide | undefined {
  const key = normalize(query)
  return manifest.guides.find((g) => normalize(g.slug) === key || normalize(g.title) === key)
}
