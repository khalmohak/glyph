import type { ReactNode } from 'react'

/** A minimal browser window around a live preview. */
export function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border-(length:--glyph-border-width) border-border bg-surface shadow-lg">
      <div className="flex h-10 items-center gap-3 border-b-(length:--glyph-border-width) border-border bg-subtle px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-pill bg-border-strong" />
          <span className="size-2.5 rounded-pill bg-border-strong" />
          <span className="size-2.5 rounded-pill bg-border-strong" />
        </span>
        <span className="mx-auto max-w-xs flex-1 truncate rounded-sm bg-background px-3 py-0.5 text-center font-mono text-caption text-muted-foreground">
          {url}
        </span>
        <span className="w-10" aria-hidden="true" />
      </div>
      {children}
    </div>
  )
}
