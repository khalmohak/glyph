/**
 * Cloudflare Pages middleware for agents reading the docs:
 * - A page requested with `Accept: text/markdown` (preferred over, or tied with, text/html)
 *   gets its Markdown export instead of the HTML shell: /components/button/ answers with
 *   /components/button.md, and the home page with /llms.txt. Pages without an export (themes,
 *   blocks) fall through to HTML.
 * - Markdown and llms.txt responses get a UTF-8 content type, and each .md file names its HTML
 *   page as canonical so search engines index one copy.
 * - HTML responses vary on Accept, so a cache never hands Markdown to a browser.
 *
 * public/_routes.json keeps hashed assets out of this function.
 */

interface Context {
  request: Request
  next: () => Promise<Response>
  env: { ASSETS: { fetch: (input: Request | string | URL) => Promise<Response> } }
}

const MARKDOWN = 'text/markdown; charset=utf-8'

/** The highest q any of `types` gets in an Accept header, or 0. */
function quality(accept: string, types: readonly string[]): number {
  let best = 0
  for (const part of accept.split(',')) {
    const [type = '', ...params] = part.trim().toLowerCase().split(';')
    if (!types.includes(type.trim())) continue
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
    best = Math.max(best, q ? Number(q.slice(2)) || 0 : 1)
  }
  return best
}

export function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false
  const markdown = quality(accept, ['text/markdown', 'text/x-markdown'])
  return markdown > 0 && markdown >= quality(accept, ['text/html'])
}

/** The Markdown export for a page path: `/` → `/llms.txt`, `/docs/forms/` → `/docs/forms.md`. */
export function markdownPath(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, '')
  if (!path) return '/llms.txt'
  // Files (anything with an extension) are served as they are.
  if (/\.[a-z0-9]+$/i.test(path)) return null
  return `${path}.md`
}

function withHeaders(response: Response, headers: Record<string, string>): Response {
  const result = new Response(response.body, response)
  for (const [name, value] of Object.entries(headers)) result.headers.set(name, value)
  return result
}

const canonical = (url: URL, mdPath: string) =>
  `<${url.origin}${mdPath.replace(/\.md$/, '/')}>; rel="canonical"`

export async function onRequest({ request, next, env }: Context): Promise<Response> {
  const url = new URL(request.url)
  const { pathname } = url

  if (pathname.endsWith('.md')) {
    const response = await next()
    if (!response.ok) return response
    return withHeaders(response, { 'Content-Type': MARKDOWN, Link: canonical(url, pathname) })
  }
  if (pathname === '/llms.txt' || pathname === '/llms-full.txt') {
    const response = await next()
    return response.ok ? withHeaders(response, { 'Content-Type': MARKDOWN }) : response
  }

  const mdPath =
    request.method === 'GET' || request.method === 'HEAD' ? markdownPath(pathname) : null
  if (mdPath && wantsMarkdown(request.headers.get('Accept'))) {
    const markdown = await env.ASSETS.fetch(new URL(mdPath, url))
    // Pages answers unknown paths with the SPA shell, so check the type as well as the status.
    if (markdown.ok && !markdown.headers.get('Content-Type')?.includes('text/html')) {
      return withHeaders(markdown, {
        'Content-Type': MARKDOWN,
        Vary: 'Accept',
        ...(mdPath.endsWith('.md') && { Link: canonical(url, mdPath) }),
      })
    }
  }

  const response = await next()
  if (!mdPath || !response.headers.get('Content-Type')?.includes('text/html')) return response
  const result = new Response(response.body, response)
  result.headers.append('Vary', 'Accept')
  return result
}
