import { cn } from '@glyphui/ui'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-5 text-foreground', className)}>
      <path d="M12 2 22 12 12 22 2 12Z" fill="currentColor" />
      <path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" className="fill-background" />
    </svg>
  )
}

export function Logo() {
  return (
    <a href="#overview" className="flex items-center gap-2 rounded-sm text-foreground">
      <LogoMark />
      <span className="font-display text-h4 lowercase">glyph</span>
    </a>
  )
}
