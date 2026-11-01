// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { markdownPath, onRequest, wantsMarkdown } from '../functions/_middleware'

const html = () => new Response('<!doctype html>', { headers: { 'Content-Type': 'text/html' } })

/** A Pages context whose static assets are `files`; anything else gets the SPA shell. */
function context(path: string, accept: string | null, files: Record<string, string> = {}) {
  const headers = new Headers(accept ? { Accept: accept } : {})
  const asset = (input: Request | string | URL) => {
    const { pathname } = new URL(input instanceof Request ? input.url : input)
    const body = files[pathname]
    return Promise.resolve(body === undefined ? html() : new Response(body))
  }
  return {
    request: new Request(`https://glyphui.xyz${path}`, { headers }),
    next: () => asset(`https://glyphui.xyz${path}`),
    env: { ASSETS: { fetch: asset } },
  }
}

describe('wantsMarkdown', () => {
  it('is false for browsers and missing headers', () => {
    expect(wantsMarkdown(null)).toBe(false)
    expect(wantsMarkdown('text/html,application/xhtml+xml,*/*;q=0.8')).toBe(false)
  })
  it('is true when Markdown is preferred or tied', () => {
    expect(wantsMarkdown('text/markdown')).toBe(true)
    expect(wantsMarkdown('text/markdown, text/html;q=0.9')).toBe(true)
    expect(wantsMarkdown('text/html, text/markdown')).toBe(true)
  })
  it('is false when HTML is preferred', () => {
    expect(wantsMarkdown('text/html, text/markdown;q=0.5')).toBe(false)
  })
})

describe('markdownPath', () => {
  it('maps pages to their exports', () => {
    expect(markdownPath('/')).toBe('/llms.txt')
    expect(markdownPath('/components/button/')).toBe('/components/button.md')
    expect(markdownPath('/docs/forms')).toBe('/docs/forms.md')
  })
  it('leaves files alone', () => {
    expect(markdownPath('/og.png')).toBeNull()
  })
})

describe('onRequest', () => {
  const files = { '/components/button.md': '# Button', '/llms.txt': '# Glyph' }

  it('serves Markdown to agents that ask for it', async () => {
    const res = await onRequest(context('/components/button/', 'text/markdown', files))
    expect(await res.text()).toBe('# Button')
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(res.headers.get('Link')).toBe(
      '<https://glyphui.xyz/components/button/>; rel="canonical"',
    )
  })

  it('serves llms.txt for the home page', async () => {
    const res = await onRequest(context('/', 'text/markdown', files))
    expect(await res.text()).toBe('# Glyph')
  })

  it('falls back to HTML for pages without an export', async () => {
    const res = await onRequest(context('/themes/', 'text/markdown', files))
    expect(res.headers.get('Content-Type')).toBe('text/html')
  })

  it('serves HTML to browsers, varying on Accept', async () => {
    const res = await onRequest(context('/components/button/', 'text/html', files))
    expect(res.headers.get('Content-Type')).toBe('text/html')
    expect(res.headers.get('Vary')).toContain('Accept')
  })

  it('labels .md files and points them at their page', async () => {
    const res = await onRequest(context('/components/button.md', null, files))
    expect(res.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(res.headers.get('Link')).toContain('/components/button/>')
  })
})
