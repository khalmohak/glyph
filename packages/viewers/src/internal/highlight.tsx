import type { ReactNode } from 'react'

/** Wraps case-insensitive matches of `query` in `<mark>`. */
export function highlight(text: string, query: string, className?: string): ReactNode {
  const q = query.trim()
  if (!q) return text
  const lower = text.toLowerCase()
  const needle = q.toLowerCase()
  const parts: ReactNode[] = []
  let from = 0
  let at = lower.indexOf(needle)
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at))
    parts.push(
      <mark key={at} className={className}>
        {text.slice(at, at + needle.length)}
      </mark>,
    )
    from = at + needle.length
    at = lower.indexOf(needle, from)
  }
  if (parts.length === 0) return text
  if (from < text.length) parts.push(text.slice(from))
  return parts
}

export const markClass = 'rounded-[2px] bg-warning/30 text-inherit'
