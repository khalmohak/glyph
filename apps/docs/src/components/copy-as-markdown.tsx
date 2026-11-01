import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  toast,
} from '@glyphui/ui'
import { Bot, ChevronDown, Copy, FileText, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { track } from '../lib/analytics'

/** The Markdown alternate of a page: `/components/button` → `<base>components/button.md`. */
export function markdownUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}.md`
}

function absolute(url: string) {
  return typeof window === 'undefined' ? url : new URL(url, window.location.origin).href
}

/**
 * "Copy page" for AI tools: copies the page as Markdown, or opens it in ChatGPT or Claude.
 * Every component and guide page has a Markdown version at the same URL plus `.md`.
 */
export function CopyAsMarkdown({ path, title }: { path: string; title: string }) {
  const [busy, setBusy] = useState(false)
  const md = markdownUrl(path)
  const prompt = (url: string) =>
    encodeURIComponent(`Read ${url} and help me use ${title} from the Glyph React library.`)

  async function copy() {
    setBusy(true)
    try {
      const res = await fetch(md)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await navigator.clipboard.writeText(await res.text())
      track('page_copied_as_markdown', { page: path })
      toast.success('Copied page as Markdown')
    } catch {
      toast.error('Couldn’t copy the page', { description: 'Open it as Markdown instead.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex items-center" data-slot="copy-as-markdown">
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Copy />}
        loading={busy}
        onClick={copy}
        className="rounded-r-none"
      >
        Copy page
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="outline"
            size="sm"
            icon={<ChevronDown />}
            aria-label="More ways to use this page"
            className="-ml-(--glyph-border-width) rounded-l-none"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem icon={<FileText />} asChild>
            <a
              href={md}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('page_opened_externally', { page: path, target: 'markdown' })}
            >
              View as Markdown
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem icon={<MessageSquare />} asChild>
            <a
              href={`https://chatgpt.com/?q=${prompt(absolute(md))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('page_opened_externally', { page: path, target: 'chatgpt' })}
            >
              Open in ChatGPT
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Bot />} asChild>
            <a
              href={`https://claude.ai/new?q=${prompt(absolute(md))}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('page_opened_externally', { page: path, target: 'claude' })}
            >
              Open in Claude
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
