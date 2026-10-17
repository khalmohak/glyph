import { Link } from 'react-router'

/** The Glyph mark and wordmark, linking home. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Glyph home"
      className={['flex items-center gap-2 rounded-sm text-foreground', className].join(' ')}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
        <path d="M12 2 22 12 12 22 2 12Z" fill="currentColor" />
        <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" className="fill-background" />
      </svg>
      <span className="font-display text-h4 lowercase">glyph</span>
    </Link>
  )
}
