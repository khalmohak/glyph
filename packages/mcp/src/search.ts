import type { Manifest } from './manifest'

export type HitKind = 'component' | 'prop' | 'guide' | 'changelog'

export interface SearchDoc {
  kind: HitKind
  title: string
  url: string
  /** Short context shown with the hit. */
  snippet: string
  /** What `get_component` / `get_guide` takes to open it. */
  ref?: string
  terms: Map<string, number>
  length: number
}

export interface SearchHit {
  kind: HitKind
  title: string
  url: string
  snippet: string
  ref?: string
  score: number
}

const stopwords = new Set(
  'a an and are as at be by can do does for from how i in is it its me my of on or the this to use using what when where which with you your'.split(
    ' ',
  ),
)

/** Lowercase words, with camelCase and kebab-case split and simple plural folding. */
export function tokenize(text: string): string[] {
  return (
    text
      // "server-side pagination" means server mode; "side" alone would match unrelated props.
      .replace(/\b(server|client)[\s-]+side\b/gi, '$1')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 1 && !stopwords.has(word))
      .map((word) =>
        word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word,
      )
  )
}

function doc(
  kind: HitKind,
  title: string,
  url: string,
  snippet: string,
  fields: [text: string, weight: number][],
  ref?: string,
): SearchDoc {
  const terms = new Map<string, number>()
  let length = 0
  for (const [text, weight] of fields) {
    for (const term of tokenize(text)) {
      terms.set(term, (terms.get(term) ?? 0) + weight)
      length += 1
    }
  }
  return { kind, title, url, snippet, terms, length, ...(ref && { ref }) }
}

const clip = (text: string, max = 180) => {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat
}

/** Splits a guide's Markdown into its `##` sections. */
function sections(markdown: string): { heading: string; body: string }[] {
  const out: { heading: string; body: string }[] = []
  let current = { heading: '', body: '' }
  for (const line of markdown.split('\n')) {
    const match = /^##\s+(.+)$/.exec(line)
    if (match) {
      out.push(current)
      current = { heading: (match[1] as string).trim(), body: '' }
    } else current.body += `${line}\n`
  }
  out.push(current)
  return out.filter((s) => s.body.trim() || s.heading)
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

/** Builds the search documents for every component, prop, guide section and release note. */
export function buildIndex(manifest: Manifest): SearchDoc[] {
  const docs: SearchDoc[] = []
  const site = manifest.site.url
  for (const c of manifest.components) {
    const url = `${site}/components/${c.slug}`
    docs.push(
      doc(
        'component',
        `${c.name}${c.status === 'planned' ? ' (planned)' : ''}`,
        url,
        c.description,
        [
          [c.name, 6],
          [c.slug, 3],
          [c.exports.join(' '), 3],
          [c.description, 2],
          [c.category, 1],
          [c.notes.join(' '), 1],
          [c.examples.map((e) => `${e.title} ${e.description ?? ''}`).join(' '), 1],
        ],
        c.name,
      ),
    )
    for (const [component, props] of Object.entries(c.props)) {
      for (const p of props) {
        docs.push(
          doc(
            'prop',
            `${component}.${p.name}`,
            url,
            clip(`${p.type}${p.description ? ` — ${p.description}` : ''}`),
            [
              [p.name, 5],
              [component, 1],
              [p.description ?? '', 1],
            ],
            c.name,
          ),
        )
      }
    }
  }
  for (const g of manifest.guides) {
    // The guide to this server describes its tools with sample queries, which would match
    // those queries. Agents already using the server don't need it in results.
    if (g.slug === 'ai') continue
    for (const s of sections(g.markdown)) {
      const anchor = s.heading ? `#${slugify(s.heading)}` : ''
      const title = s.heading ? `${g.title} › ${s.heading}` : g.title
      docs.push(
        doc(
          'guide',
          title,
          `${site}/docs/${g.slug}${anchor}`,
          clip(
            s.body
              .replace(/```[\s\S]*?```/g, ' ')
              .replace(/`/g, '')
              .replace(/[#>*|]/g, ' '),
          ),
          [
            [g.title, 2],
            [s.heading, 4],
            [s.body, 1],
          ],
          g.slug,
        ),
      )
    }
  }
  for (const release of manifest.changelog) {
    for (const entry of release.entries) {
      docs.push(
        doc(
          'changelog',
          `${release.version}: ${clip(entry.text.split('\n')[0] ?? '', 80)}`,
          `${site}/changelog`,
          clip(entry.text),
          [[entry.text, 1]],
        ),
      )
    }
  }
  return docs
}

/** Ranks documents against a query with BM25. Component hits get a small boost. */
export function search(index: SearchDoc[], query: string, limit = 10): SearchHit[] {
  const terms = [...new Set(tokenize(query))]
  if (terms.length === 0) return []
  const n = index.length
  const avg = index.reduce((sum, d) => sum + d.length, 0) / Math.max(n, 1)
  const df = new Map(terms.map((t) => [t, index.filter((d) => d.terms.has(t)).length]))
  const k1 = 1.2
  const b = 0.75
  const boost: Record<HitKind, number> = { component: 1.25, guide: 1.1, prop: 0.9, changelog: 0.6 }
  return index
    .map((d) => {
      let score = 0
      let matched = 0
      for (const t of terms) {
        const tf = d.terms.get(t) ?? 0
        if (!tf) continue
        matched += 1
        const freq = df.get(t) ?? 0
        const idf = Math.log(1 + (n - freq + 0.5) / (freq + 0.5))
        // A prop is a few words long; without a floor, BM25's length normalization lets it
        // outrank whole guide sections that match better.
        const length = d.kind === 'prop' ? Math.max(d.length, avg) : d.length
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * length) / avg)))
      }
      // Documents matching more of the query's words rank above partial matches.
      score *= boost[d.kind] * (matched / terms.length) ** 2
      return { d, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ d, score }) => ({
      kind: d.kind,
      title: d.title,
      url: d.url,
      snippet: d.snippet,
      ...(d.ref && { ref: d.ref }),
      score: Math.round(score * 100) / 100,
    }))
}
