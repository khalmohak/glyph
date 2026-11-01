/**
 * Cloudflare Pages Function: forwards glyphui.xyz/ingest/* to PostHog, so analytics requests go
 * to this site's own domain and ad blockers don't drop them (src/lib/analytics.ts). Only
 * /ingest/* runs it; every other path is served as a static file.
 */

// The PostHog project's region. Keep UI_HOST in src/lib/analytics.ts in the same region.
const API_HOST = 'us.i.posthog.com'
const ASSET_HOST = 'us-assets.i.posthog.com'

export async function onRequest({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/ingest/, '') || '/'
  const host = path.startsWith('/static/') ? ASSET_HOST : API_HOST
  const upstream = new Request(`https://${host}${path}${url.search}`, request)
  upstream.headers.delete('cookie')
  // PostHog geolocates by IP; pass on the visitor's rather than Cloudflare's.
  const ip = request.headers.get('cf-connecting-ip')
  if (ip) upstream.headers.set('x-forwarded-for', ip)
  return fetch(upstream)
}
