import {
  Card,
  Eyebrow,
  Heading,
  Input,
  SegmentedControl,
  Select,
  SelectItem,
  Text,
} from '@glyphui/ui'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { StatusBadge } from '../components/status-badge'
import { catalog, countByStatus } from '../lib/catalog'
import { type Category, categories, type Status } from '../lib/doc'

type StatusFilter = Status | 'all'

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const status = (params.get('status') as StatusFilter | null) ?? 'all'
  const category = (params.get('category') as Category | 'all' | null) ?? 'all'
  const counts = countByStatus()
  const total = counts.stable + counts.beta + counts.planned

  const setParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'all' || value === '') next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter(
      (doc) =>
        (status === 'all' || doc.status === status) &&
        (category === 'all' || doc.category === category) &&
        (!q || doc.name.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q)),
    )
  }, [query, status, category])

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <Eyebrow>Catalog</Eyebrow>
        <Heading level={1}>Components</Heading>
        <Text size="lead" tone="muted" className="max-w-2xl">
          Every component in Glyph and every one on the roadmap. {counts.stable} stable,{' '}
          {counts.beta} in beta, {counts.planned} planned.
        </Text>
        <div
          className="flex h-2 w-full max-w-xl overflow-hidden rounded-pill bg-muted"
          aria-hidden="true"
        >
          <div className="bg-success" style={{ width: `${(counts.stable / total) * 100}%` }} />
          <div className="bg-warning" style={{ width: `${(counts.beta / total) * 100}%` }} />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          aria-label="Search components"
          placeholder="Search components"
          prefix={<Search />}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setParam('q', e.target.value)
          }}
          className="w-full sm:w-64"
          autoFocus
        />
        <SegmentedControl<StatusFilter>
          aria-label="Status"
          size="sm"
          value={status}
          onValueChange={(v) => setParam('status', v)}
          options={[
            { value: 'all', label: 'All' },
            { value: 'stable', label: 'Stable' },
            { value: 'beta', label: 'Beta' },
            { value: 'planned', label: 'Planned' },
          ]}
        />
        <Select<Category | 'all'>
          size="sm"
          aria-label="Category"
          value={category}
          onValueChange={(v) => setParam('category', v)}
          className="w-44"
        >
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </Select>
      </div>

      {results.length === 0 ? (
        <Text tone="muted">No components match. Try a shorter search or another filter.</Text>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((doc) => (
            <li key={doc.slug} className="min-w-0">
              <Card variant="interactive" padding="sm" className="h-full" asChild>
                <Link to={`/components/${doc.slug}`}>
                  <div className="flex items-center justify-between gap-2 px-1 pt-1">
                    <span className="font-display text-h4">{doc.name}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <Text size="small" tone="muted" className="px-1">
                    {doc.description}
                  </Text>
                  <span className="mt-auto px-1 pb-1 font-mono text-caption text-faint-foreground">
                    {doc.category}
                  </span>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
