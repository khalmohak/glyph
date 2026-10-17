import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * One timeline from every package's CHANGELOG.md (written by Changesets), plus changesets
 * that haven't been released yet. Changesets copies an entry into each package it touches;
 * here each entry appears once, tagged with its packages.
 */

export type ChangeKind = 'major' | 'minor' | 'patch'

export interface ChangelogEntry {
  /** Markdown, with the PR / commit / author prefix removed. */
  text: string
  kind: ChangeKind
  packages: string[]
  pr?: { number: number; url: string }
  commit?: { sha: string; url: string }
}

export interface ChangelogRelease {
  /** `0.8.0`, or `Unreleased` for pending changesets. */
  version: string
  entries: ChangelogEntry[]
}

const kindOf: Record<string, ChangeKind> = {
  'Major Changes': 'major',
  'Minor Changes': 'minor',
  'Patch Changes': 'patch',
}
const kindRank: Record<ChangeKind, number> = { major: 0, minor: 1, patch: 2 }

// - [#24](https://…/pull/24) [`b746553`](https://…/commit/b746…) Thanks [@khalmohak](…)! - Text
const prefix =
  /^(?:\[#(\d+)\]\(([^)]+)\)\s*)?(?:\[`([0-9a-f]+)`\]\(([^)]+)\)\s*)?(?:Thanks \[@[^\]]+\]\([^)]+\)!\s*)?-\s*/

function parseEntry(raw: string, kind: ChangeKind, pkg: string): ChangelogEntry | null {
  const match = raw.match(prefix)
  const text = (match ? raw.slice(match[0].length) : raw).trim()
  if (!text || text.startsWith('Updated dependencies')) return null
  return {
    text,
    kind,
    packages: [pkg],
    ...(match?.[1] && match[2] && { pr: { number: Number(match[1]), url: match[2] } }),
    ...(match?.[3] && match[4] && { commit: { sha: match[3], url: match[4] } }),
  }
}

/** Splits one CHANGELOG.md into versions and their bullet entries. */
export function parseChangelog(source: string, pkg: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = []
  let release: ChangelogRelease | undefined
  let kind: ChangeKind = 'patch'
  let item: string[] | null = null
  const flush = () => {
    if (item && release) {
      const entry = parseEntry(item.join('\n'), kind, pkg)
      if (entry) release.entries.push(entry)
    }
    item = null
  }
  for (const line of source.split('\n')) {
    const version = line.match(/^## (\S+)/)
    const heading = line.match(/^### (.+)/)
    if (version) {
      flush()
      release = { version: version[1] as string, entries: [] }
      releases.push(release)
    } else if (heading) {
      flush()
      kind = kindOf[(heading[1] as string).trim()] ?? 'patch'
    } else if (line.startsWith('- ')) {
      flush()
      item = [line.slice(2)]
    } else if (item) {
      // Continuation lines are indented two spaces under their bullet.
      item.push(line.startsWith('  ') ? line.slice(2) : line)
    }
  }
  flush()
  return releases
}

/** Pending `.changeset/*.md` files: frontmatter of `"pkg": bump`, then the text. */
function unreleased(changesetDir: string): ChangelogEntry[] {
  if (!existsSync(changesetDir)) return []
  return readdirSync(changesetDir)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .flatMap((file) => {
      const source = readFileSync(join(changesetDir, file), 'utf8')
      const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
      if (!match) return []
      const bumps = [...(match[1] as string).matchAll(/"([^"]+)":\s*(major|minor|patch)/g)]
      if (bumps.length === 0) return []
      const kind = bumps
        .map((b) => b[2] as ChangeKind)
        .sort((a, b) => kindRank[a] - kindRank[b])[0] as ChangeKind
      return [
        {
          text: (match[2] as string).trim(),
          kind,
          packages: bumps.map((b) => b[1] as string).sort(),
        },
      ]
    })
}

const versionKey = (v: string) => v.split('.').map((n) => Number(n.replace(/\D.*$/, '')) || 0)
function compareVersions(a: string, b: string) {
  const [x, y] = [versionKey(a), versionKey(b)]
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const diff = (y[i] ?? 0) - (x[i] ?? 0)
    if (diff) return diff
  }
  return 0
}

/** The merged timeline, newest first, entries ordered major → minor → patch. */
export function readChangelog(packagesDir: string, changesetDir: string): ChangelogRelease[] {
  const byVersion = new Map<string, ChangelogEntry[]>()
  for (const dir of readdirSync(packagesDir)) {
    const file = join(packagesDir, dir, 'CHANGELOG.md')
    if (!existsSync(file)) continue
    const pkg = JSON.parse(readFileSync(join(packagesDir, dir, 'package.json'), 'utf8')).name
    for (const release of parseChangelog(readFileSync(file, 'utf8'), pkg)) {
      const entries = byVersion.get(release.version) ?? []
      for (const entry of release.entries) {
        const same = entries.find((e) => e.text === entry.text)
        if (same) {
          if (!same.packages.includes(pkg)) same.packages.push(pkg)
          if (kindRank[entry.kind] < kindRank[same.kind]) same.kind = entry.kind
        } else entries.push(entry)
      }
      byVersion.set(release.version, entries)
    }
  }
  const releases = [...byVersion.entries()]
    .sort(([a], [b]) => compareVersions(a, b))
    .map(([version, entries]) => ({
      version,
      entries: entries
        .map((e) => ({ ...e, packages: [...e.packages].sort() }))
        .sort((a, b) => kindRank[a.kind] - kindRank[b.kind]),
    }))
    .filter((release) => release.entries.length > 0)
  const pending = unreleased(changesetDir)
  return pending.length > 0 ? [{ version: 'Unreleased', entries: pending }, ...releases] : releases
}
