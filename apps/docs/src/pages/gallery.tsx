import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Heading,
  Input,
  SegmentedControl,
  Select,
  SelectItem,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from '@glyphui/ui'
import { LayoutGrid, List, Search, SearchX } from 'lucide-react'
import { Fragment, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ScaledPreview } from '../components/scaled-preview'
import { StatusBadge } from '../components/status-badge'
import { addedIn, isNew } from '../lib/added'
import { catalog, countByStatus, docs } from '../lib/catalog'
import { type Category, categories, type DocMeta, type Status } from '../lib/doc'

type StatusFilter = Status | 'all'
type Sort = 'name' | 'category' | 'newest'
type View = 'grid' | 'list'

const sortLabels: Record<Sort, string> = { name: 'A–Z', category: 'Category', newest: 'Newest' }

/** Release order for "newest": compare `0.10.0` above `0.9.0`. */
const versionKey = (slug: string) =>
  (addedIn[slug] ?? '0.0.0')
    .split('.')
    .map((n) => n.padStart(4, '0'))
    .join('.')

function useGalleryParams() {
  const [params, setParams] = useSearchParams()
  const pick = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const value = params.get(key) as T | null
    return value && allowed.includes(value) ? value : fallback
  }
  const state = {
    q: params.get('q') ?? '',
    category: pick<Category | 'all'>('category', ['all', ...categories], 'all'),
    status: pick<StatusFilter>('status', ['all', 'stable', 'beta', 'planned'], 'all'),
    sort: pick<Sort>('sort', ['name', 'category', 'newest'], 'name'),
    view: pick<View>('view', ['grid', 'list'], 'grid'),
  }
  const defaults: Record<string, string> = {
    q: '',
    category: 'all',
    status: 'all',
    sort: 'name',
    view: 'grid',
  }
  const set = (key: keyof typeof state, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === defaults[key]) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  const clear = () => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })
  return { ...state, set, clear }
}

function matches(doc: DocMeta, q: string) {
  if (!q) return true
  const needle = q.toLowerCase()
  return (
    doc.name.toLowerCase().includes(needle) ||
    doc.description.toLowerCase().includes(needle) ||
    doc.category.toLowerCase().includes(needle) ||
    (doc.exports ?? []).some((name) => name.toLowerCase().includes(needle))
  )
}

/** /components: every component as a live thumbnail, filterable and shareable by URL. */
export function GalleryPage() {
  const { q, category, status, sort, view, set, clear } = useGalleryParams()
  const counts = countByStatus()
  const total = counts.stable + counts.beta + counts.planned

  const results = useMemo(() => {
    const list = catalog.filter(
      (doc) =>
        (status === 'all' || doc.status === status) &&
        (category === 'all' || doc.category === category) &&
        matches(doc, q.trim()),
    )
    if (sort === 'newest')
      return [...list].sort(
        (a, b) =>
          versionKey(b.slug).localeCompare(versionKey(a.slug)) || a.name.localeCompare(b.name),
      )
    if (sort === 'category')
      return [...list].sort(
        (a, b) =>
          categories.indexOf(a.category) - categories.indexOf(b.category) ||
          a.name.localeCompare(b.name),
      )
    return list
  }, [q, category, status, sort])

  const filtered = q !== '' || category !== 'all' || status !== 'all'
  const groups =
    sort === 'category'
      ? categories
          .map((c) => ({ category: c, items: results.filter((d) => d.category === c) }))
          .filter((g) => g.items.length > 0)
      : [{ category: null, items: results }]

  return (
    <div className="grid gap-8">
      <header className="grid gap-4">
        <Eyebrow>Library</Eyebrow>
        <Heading level={1}>Components</Heading>
        <Text size="lead" tone="muted" className="max-w-2xl">
          {docs.length} components, each previewed live below with the active theme. Pick one for
          its examples, props and theming. {counts.beta} are in beta and {counts.planned} are
          planned.
        </Text>
        <div className="flex max-w-xl items-center gap-3">
          <div
            className="flex h-1.5 flex-1 overflow-hidden rounded-pill bg-muted"
            role="img"
            aria-label={`${counts.stable} stable, ${counts.beta} beta, ${counts.planned} planned`}
          >
            <div className="bg-success" style={{ width: `${(counts.stable / total) * 100}%` }} />
            <div className="bg-warning" style={{ width: `${(counts.beta / total) * 100}%` }} />
          </div>
          <Text size="caption" tone="muted" className="shrink-0 tabular-nums">
            {counts.stable} stable · {counts.beta} beta · {counts.planned} planned
          </Text>
        </div>
      </header>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="search"
            size="sm"
            aria-label="Search components"
            placeholder="Search by name, export or category"
            prefix={<Search />}
            value={q}
            onChange={(e) => set('q', e.target.value)}
            className="w-full sm:w-72"
          />
          <SegmentedControl<StatusFilter>
            aria-label="Status"
            size="sm"
            value={status}
            onValueChange={(v) => set('status', v)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'stable', label: 'Stable' },
              { value: 'beta', label: 'Beta' },
              { value: 'planned', label: 'Planned' },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <Select<Sort>
              size="sm"
              aria-label="Sort"
              value={sort}
              onValueChange={(v) => set('sort', v)}
              className="w-32"
            >
              {(Object.keys(sortLabels) as Sort[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {sortLabels[key]}
                </SelectItem>
              ))}
            </Select>
            <SegmentedControl<View>
              aria-label="Layout"
              size="sm"
              value={view}
              onValueChange={(v) => set('view', v)}
              options={[
                {
                  value: 'grid',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <LayoutGrid className="size-3.5" aria-hidden="true" />
                      <span className="max-sm:sr-only">Grid</span>
                    </span>
                  ),
                },
                {
                  value: 'list',
                  label: (
                    <span className="flex items-center gap-1.5">
                      <List className="size-3.5" aria-hidden="true" />
                      <span className="max-sm:sr-only">List</span>
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <Select<Category | 'all'>
          size="sm"
          aria-label="Category"
          value={category}
          onValueChange={(v) => set('category', v)}
          className="w-full md:hidden"
        >
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </Select>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          aria-label="Category"
          value={category === 'all' ? '' : category}
          onValueChange={(v) => set('category', v || 'all')}
          className="flex-wrap justify-start max-md:hidden"
        >
          {categories.map((c) => (
            <ToggleGroupItem key={c} value={c}>
              {c}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Text size="small" tone="muted" aria-live="polite" className="tabular-nums">
          {filtered
            ? `${results.length} of ${catalog.length} shown`
            : `${docs.length} components, ${counts.planned} planned`}
        </Text>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear filters
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title="No components match"
          description="Try a shorter search, or clear the filters."
          action={
            <Button variant="outline" size="sm" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        groups.map((group) => (
          <Fragment key={group.category ?? 'all'}>
            {group.category && (
              <Heading level={2} size="h4" className="-mb-4 pt-2">
                {group.category}{' '}
                <span className="text-small font-normal text-muted-foreground tabular-nums">
                  {group.items.length}
                </span>
              </Heading>
            )}
            {view === 'grid' ? <Grid items={group.items} /> : <Rows items={group.items} />}
          </Fragment>
        ))
      )}
    </div>
  )
}

function Grid({ items }: { items: DocMeta[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((doc) => {
        const first = doc.examples?.[0]
        return (
          <li key={doc.slug} className="min-w-0">
            <Card
              variant="interactive"
              padding="none"
              className="group h-full overflow-hidden"
              asChild
            >
              <Link to={`/components/${doc.slug}`} aria-label={`${doc.name}: ${doc.description}`}>
                <div className="border-b-(length:--glyph-border-width) border-border bg-subtle">
                  {first ? (
                    <ScaledPreview slug={doc.slug} file={first.file} />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="grid aspect-[16/10] place-items-center font-display text-h3 text-faint-foreground"
                    >
                      {doc.name}
                    </div>
                  )}
                </div>
                <div className="grid gap-1.5 p-4" aria-hidden="true">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-display text-h4 group-hover:text-primary-text">
                        {doc.name}
                      </span>
                      {isNew(doc.slug) && (
                        <Badge tone="primary" variant="soft" className="shrink-0">
                          New
                        </Badge>
                      )}
                    </span>
                    {doc.status === 'planned' && <StatusBadge status="planned" />}
                  </div>
                  <Text size="small" tone="muted" className="line-clamp-2">
                    {doc.description}
                  </Text>
                  <span className="flex items-center gap-2 pt-1 font-mono text-caption text-faint-foreground">
                    <span>{doc.category}</span>
                    <span>·</span>
                    <span className="truncate">{doc.entry ?? '@glyphui/ui'}</span>
                    {doc.status === 'beta' && (
                      <>
                        <span>·</span>
                        <span className="text-warning-text">beta</span>
                      </>
                    )}
                  </span>
                </div>
              </Link>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function Rows({ items }: { items: DocMeta[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-surface">
      {items.map((doc) => (
        <li key={doc.slug}>
          <Link
            to={`/components/${doc.slug}`}
            className="grid gap-1 px-4 py-3 outline-none hover:bg-muted focus-visible:bg-muted sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:gap-4"
          >
            <span className="flex items-center gap-2 font-medium">
              {doc.name}
              {isNew(doc.slug) && (
                <Badge tone="primary" className="shrink-0">
                  New
                </Badge>
              )}
            </span>
            <Text size="small" tone="muted" className="min-w-0 truncate">
              {doc.description}
            </Text>
            <span className="flex items-center gap-2">
              <span className="font-mono text-caption text-faint-foreground">{doc.category}</span>
              <StatusBadge status={doc.status} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
