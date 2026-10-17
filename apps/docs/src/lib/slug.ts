/**
 * Heading ids for guides and the changelog. Shared by the MDX build, the table of contents,
 * search and the Markdown exports, so an anchor is the same everywhere. Node-safe.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
}

/** The changelog anchor for a release: `0.8.0` → `v0-8-0`, `Unreleased` → `unreleased`. */
export function releaseAnchor(version: string): string {
  return /^\d/.test(version) ? `v${version.replace(/\./g, '-')}` : slugify(version)
}

/** Returns a slugger that numbers repeats GitHub-style: `setup`, `setup-1`, `setup-2`. */
export function createSlugger() {
  const seen = new Map<string, number>()
  return (text: string) => {
    const base = slugify(text) || 'section'
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}
