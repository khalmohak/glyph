import { cn, IconButton, Tooltip } from '@glyphui/ui'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

/** Copy-to-clipboard button. Falls back silently when the clipboard is blocked. */
export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Tooltip content={copied ? 'Copied' : 'Copy'}>
      <IconButton
        size="sm"
        className={className}
        icon={copied ? <Check /> : <Copy />}
        aria-label={copied ? 'Copied' : 'Copy code'}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          } catch {
            // Clipboard unavailable: the code stays selectable.
          }
        }}
      />
    </Tooltip>
  )
}

/** A short, unhighlighted command or code line with a copy button. */
export function Snippet({ code, className }: { code: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-md border-(length:--glyph-border-width) border-border bg-subtle py-1 pr-1 pl-4',
        className,
      )}
    >
      {/* Long lines wrap rather than scroll: a scrolling <pre> would need its own Tab stop. */}
      <pre className="min-w-0 flex-1 py-1.5 font-mono text-[0.8125rem] whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  )
}

/** Pre-highlighted code (from the build-time highlighter) with a copy button. */
export function HighlightedCode({
  html,
  code,
  className,
}: {
  html: string
  code: string
  className?: string
}) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <CopyButton text={code} className="absolute top-2 right-2 z-10" />
      <div
        className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed [&_pre]:bg-transparent"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: generated at build time by shiki from repo files
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
