#!/usr/bin/env node
/**
 * Prepares Cloudflare for the site, idempotently: the Pages projects, their custom domains
 * and the DNS records that point the domains at them. Run by the deploy workflow before
 * publishing; safe to run again at any time.
 *
 *   CLOUDFLARE_API_TOKEN   token with Account › Cloudflare Pages: Edit, Zone › DNS: Edit,
 *                          Zone › Zone: Read (for the domain's zone)
 *   CLOUDFLARE_ACCOUNT_ID  the account that owns the zone
 *   CLOUDFLARE_DOMAIN      the apex domain, e.g. glyphui.xyz
 *
 * Usage: node scripts/cloudflare.mjs [--dry-run]
 */

const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env
const domain = process.env.CLOUDFLARE_DOMAIN || 'glyphui.xyz'
const dryRun = process.argv.includes('--dry-run')

/** One Pages project per app, and the hostname it serves. */
export const projects = [
  { name: 'glyph-docs', host: domain },
  { name: 'glyph-demo', host: `demo.${domain}` },
  { name: 'glyph-auth', host: `auth.${domain}` },
]

async function api(path, init = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...init.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  return { ok: response.ok && body.success !== false, status: response.status, body }
}

function fail(step, result) {
  const errors = (result.body.errors ?? []).map((e) => `${e.code}: ${e.message}`).join('; ')
  throw new Error(`${step} failed (HTTP ${result.status}) ${errors}`)
}

async function ensureProject(name) {
  const found = await api(`/accounts/${account}/pages/projects/${name}`)
  if (found.ok) return found.body.result
  if (found.status !== 404) fail(`Reading Pages project ${name}`, found)
  console.log(`+ Pages project ${name}`)
  if (dryRun) return { subdomain: `${name}.pages.dev` }
  const created = await api(`/accounts/${account}/pages/projects`, {
    method: 'POST',
    body: JSON.stringify({ name, production_branch: 'main' }),
  })
  if (!created.ok) fail(`Creating Pages project ${name}`, created)
  return created.body.result
}

async function ensureDomain(name, host) {
  const list = await api(`/accounts/${account}/pages/projects/${name}/domains`)
  if (!list.ok) fail(`Listing domains of ${name}`, list)
  if (list.body.result.some((d) => d.name === host)) return
  console.log(`+ ${host} → Pages project ${name}`)
  if (dryRun) return
  const added = await api(`/accounts/${account}/pages/projects/${name}/domains`, {
    method: 'POST',
    body: JSON.stringify({ name: host }),
  })
  if (!added.ok) fail(`Adding ${host} to ${name}`, added)
}

async function ensureRecord(zone, host, target) {
  const existing = await api(`/zones/${zone}/dns_records?name=${encodeURIComponent(host)}`)
  if (!existing.ok) fail(`Reading DNS for ${host}`, existing)
  if (existing.body.result.length > 0) return
  console.log(`+ DNS CNAME ${host} → ${target}`)
  if (dryRun) return
  // Proxied CNAME; at the apex Cloudflare flattens it.
  const created = await api(`/zones/${zone}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({ type: 'CNAME', name: host, content: target, proxied: true, ttl: 1 }),
  })
  if (!created.ok) fail(`Creating DNS for ${host}`, created)
}

async function main() {
  if (!token || !account) {
    console.log('CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID not set; nothing to do.')
    return
  }
  const zones = await api(`/zones?name=${encodeURIComponent(domain)}`)
  if (!zones.ok) fail(`Looking up the zone for ${domain}`, zones)
  const zone = zones.body.result[0]
  if (!zone) throw new Error(`${domain} is not a zone in this Cloudflare account. Add it first.`)
  if (zone.status !== 'active')
    console.log(
      `Note: ${domain} is "${zone.status}"; finish the nameserver change at your registrar.`,
    )

  for (const { name, host } of projects) {
    const project = await ensureProject(name)
    await ensureDomain(name, host)
    await ensureRecord(zone.id, host, project.subdomain)
  }
  console.log(dryRun ? 'Dry run: no changes made.' : 'Cloudflare is ready.')
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
