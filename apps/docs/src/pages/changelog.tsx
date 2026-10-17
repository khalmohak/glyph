import changelogData from 'virtual:glyph-changelog'
import {
  Badge,
  Container,
  EmptyState,
  Eyebrow,
  Heading,
  SegmentedControl,
  Select,
  SelectItem,
  Text,
} from '@glyphui/ui'
import { MarkdownViewer } from '@glyphui/viewers/markdown'
import { GitPullRequest, History } from 'lucide-react'
import { useSearchParams } from 'react-router'
import type { ChangeKind, ChangelogRelease } from '../../plugins/changelog'
import { CopyAsMarkdown } from '../components/copy-as-markdown'
import { releaseAnchor } from '../lib/slug'

/** Every release, newest first (from the packages' CHANGELOG.md files and pending changesets). */
const changelog = changelogData as ChangelogRelease[]

const packages = [
  { value: 'all', label: 'All packages' },
  { value: '@glyphui/ui', label: 'ui' },
  { value: '@glyphui/tokens', label: 'tokens' },
  { value: '@glyphui/blocks', label: 'blocks' },
  { value: '@glyphui/auth', label: 'auth' },
  { value: '@glyphui/viewers', label: 'viewers' },
] as const
type PackageFilter = (typeof packages)[number]['value']

const kindLabel: Record<ChangeKind, string> = { major: 'Breaking', minor: 'Feature', patch: 'Fix' }
const kindTone = { major: 'danger', minor: 'primary', patch: 'neutral' } as const
const kindCount: Record<ChangeKind, string> = { major: 'breaking', minor: 'feature', patch: 'fix' }
const kindCounts: Record<ChangeKind, string> = {
  major: 'breaking',
  minor: 'features',
  patch: 'fixes',
}

const releaseId = releaseAnchor

function filtered(releases: ChangelogRelease[], pkg: PackageFilter): ChangelogRelease[] {
  if (pkg === 'all') return releases
  return releases
    .map((r) => ({ ...r, entries: r.entries.filter((e) => e.packages.includes(pkg)) }))
    .filter((r) => r.entries.length > 0)
}

function Release({ release }: { release: ChangelogRelease }) {
  const id = releaseId(release.version)
  const counts = { major: 0, minor: 0, patch: 0 }
  for (const entry of release.entries) counts[entry.kind]++
  return (
    <section aria-labelledby={id} className="grid scroll-mt-24 gap-5" id={`${id}-section`}>
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <Heading level={2} size="h3" id={id} className="scroll-mt-24 font-mono tracking-tight">
          <a href={`#${id}`} className="hover:underline">
            {release.version}
          </a>
        </Heading>
        <span className="flex flex-wrap gap-1.5">
          {(['major', 'minor', 'patch'] as const).map((kind) =>
            counts[kind] > 0 ? (
              <Badge key={kind} tone={kindTone[kind]} variant="soft">
                {counts[kind]} {(counts[kind] === 1 ? kindCount : kindCounts)[kind]}
              </Badge>
            ) : null,
          )}
        </span>
      </header>
      <ol className="grid gap-4 border-l-(length:--glyph-border-width) border-border pl-5">
        {release.entries.map((entry) => (
          <li key={`${entry.kind}-${entry.text.slice(0, 80)}`} className="relative grid gap-2">
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[calc(1.25rem+4.5px)] size-2 rounded-pill bg-border-strong ring-4 ring-background"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={kindTone[entry.kind]} variant="outline">
                {kindLabel[entry.kind]}
              </Badge>
              {entry.packages.map((pkg) => (
                <Badge key={pkg} variant="soft" className="font-mono">
                  {pkg.replace('@glyphui/', '')}
                </Badge>
              ))}
              {entry.pr && (
                <a
                  href={entry.pr.url}
                  className="inline-flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground"
                >
                  <GitPullRequest className="size-3.5" aria-hidden="true" />#{entry.pr.number}
                </a>
              )}
            </div>
            <MarkdownViewer
              content={entry.text}
              headingAnchors={false}
              className="max-w-none text-small [&_li]:my-1 [&_p]:my-2 [&_ul]:my-2"
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

/** /changelog: every release of every package, newest first. */
export function ChangelogPage() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('package')
  const pkg: PackageFilter = packages.some((p) => p.value === raw) ? (raw as PackageFilter) : 'all'
  const releases = filtered(changelog, pkg)
  const setPkg = (value: PackageFilter) =>
    setParams(value === 'all' ? {} : { package: value }, {
      replace: true,
      preventScrollReset: true,
    })

  return (
    <Container className="py-12 sm:py-16">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Releases" className="sticky top-24 grid gap-1 text-small">
            <Text
              size="caption"
              weight="medium"
              tone="muted"
              className="mb-2 font-mono uppercase tracking-wide"
            >
              Releases
            </Text>
            {releases.map((r) => (
              <a
                key={r.version}
                href={`#${releaseId(r.version)}`}
                className="rounded-sm px-2 py-1 font-mono text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {r.version}
              </a>
            ))}
          </nav>
        </aside>
        <div className="grid min-w-0 max-w-3xl content-start gap-10">
          <header className="grid gap-3">
            <Eyebrow>Releases</Eyebrow>
            <Heading level={1}>Changelog</Heading>
            <Text size="lead" tone="muted" className="max-w-2xl text-pretty">
              Every package is released together under one version number. Each change is listed
              once, with the packages it touched.
            </Text>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="max-sm:hidden">
                <SegmentedControl<PackageFilter>
                  aria-label="Package"
                  size="sm"
                  value={pkg}
                  onValueChange={setPkg}
                  options={packages.map((p) => ({ value: p.value, label: p.label }))}
                />
              </div>
              <Select<PackageFilter>
                aria-label="Package"
                size="sm"
                value={pkg}
                onValueChange={setPkg}
                className="w-44 sm:hidden"
              >
                {packages.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </Select>
              <CopyAsMarkdown path="/changelog" title="the Glyph changelog" />
            </div>
          </header>
          {releases.length === 0 ? (
            <EmptyState
              icon={<History />}
              title="No releases for this package yet"
              description="Pick another package or show all of them."
            />
          ) : (
            releases.map((release) => <Release key={release.version} release={release} />)
          )}
        </div>
      </div>
    </Container>
  )
}
