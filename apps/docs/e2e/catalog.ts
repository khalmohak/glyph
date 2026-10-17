import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DocMeta } from '../src/lib/doc'

const contentRoot = join(dirname(fileURLToPath(import.meta.url)), '../src/content')

const slugs = readdirSync(contentRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(contentRoot, d.name, 'meta.ts')))
  .map((d) => d.name)
  .sort()

/** Every built component's docs metadata, read from the same files the site renders. */
export const docs: DocMeta[] = await Promise.all(
  slugs.map(async (slug) => (await import(join(contentRoot, slug, 'meta.ts'))).default as DocMeta),
)

const { roadmap } = (await import(join(contentRoot, 'roadmap.ts'))) as { roadmap: DocMeta[] }

/** Every route the docs prerender: static pages, component pages and planned pages. */
export const routes: string[] = [
  '/',
  '/getting-started/',
  '/components/',
  ...docs.map((d) => `/components/${d.slug}/`),
  ...roadmap.filter((r) => !slugs.includes(r.slug)).map((r) => `/components/${r.slug}/`),
]

/** Every example, as `slug/file`. */
export const examples: { slug: string; file: string; id: string }[] = docs.flatMap((d) =>
  (d.examples ?? []).map((e) => ({ slug: d.slug, file: e.file, id: `${d.slug}/${e.file}` })),
)
