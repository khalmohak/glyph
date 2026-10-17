import { useEffect, useState } from 'react'

export interface TocItem {
  id: string
  label: string
}

/** Tracks which section is at the top of the viewport, for the "On this page" highlight. */
function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null)
  const key = ids.join('|')
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for `ids`
  useEffect(() => {
    setActive(ids[0] ?? null)
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting)
        const first = ids.find((id) => visible.get(id))
        if (first) setActive(first)
      },
      // A section counts once it reaches the top fifth of the screen, below the sticky header.
      { rootMargin: '-72px 0px -70% 0px' },
    )
    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    }
    // Sections at the very end can't scroll up to the top band; at the bottom, the last wins.
    const onScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const last = ids.at(-1)
      if (bottom && last) setActive(last)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [key])
  return [active, setActive] as const
}

/** Sticky "On this page" list for wide screens. */
export function Toc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useActiveSection(items.map((item) => item.id))
  if (items.length < 2) return null
  return (
    <nav aria-label="On this page" className="grid content-start gap-2 text-small">
      <p className="font-mono text-caption tracking-wider text-faint-foreground uppercase">
        On this page
      </p>
      <ul className="grid gap-1 border-l-(length:--glyph-border-width) border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              onClick={(event) => {
                const target = document.getElementById(item.id)
                if (!target) return
                // Scroll without a hash change, so the router and tab state are left alone.
                event.preventDefault()
                setActive(item.id)
                target.scrollIntoView({ block: 'start', behavior: 'smooth' })
                target.focus({ preventScroll: true })
              }}
              className={[
                '-ml-px block border-l-2 py-1 pl-3 transition-colors',
                active === item.id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
