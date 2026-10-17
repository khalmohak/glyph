#!/usr/bin/env node
/**
 * Consumer smoke test: install Glyph the way a user does and make sure a fresh app
 * type-checks (skipLibCheck: false) and builds.
 *
 * 1. Build the packages (skip with --skip-build).
 * 2. `pnpm pack` tokens, ui, blocks and auth into a temp folder.
 * 3. Copy ./template into the temp folder. Every dependency is resolved to the newest
 *    version that is inside the range Glyph declares (peers) or the `latest` tag (tooling),
 *    and at least MIN_AGE_DAYS old, matching the repo's release-age policy.
 * 4. `npm install` the tarballs (no workspace links), then `tsc -b` and `vite build`.
 *
 * Usage: pnpm test:consumer [--skip-build] [--keep]
 */
import { execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MIN_AGE_DAYS = 14
const PACKAGES = ['tokens', 'ui', 'blocks', 'auth']
const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const args = new Set(process.argv.slice(2))

const run = (cmd, argv, opts = {}) => {
  console.log(`\n$ ${cmd} ${argv.join(' ')}`)
  execFileSync(cmd, argv, { stdio: 'inherit', ...opts })
}
const npmJson = (argv) => JSON.parse(execFileSync('npm', [...argv, '--json'], { encoding: 'utf8' }))

const cutoff = Date.now() - MIN_AGE_DAYS * 86_400_000
const parse = (v) => v.split('.').map(Number)
const newer = (a, b) => {
  const [x, y] = [parse(a), parse(b)]
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]
  return false
}

/** Newest stable version of `name` within `range` released before the cutoff. */
function resolveVersion(name, range = 'latest') {
  const times = npmJson(['view', name, 'time'])
  let candidates = npmJson(['view', `${name}@${range}`, 'version'])
  candidates = Array.isArray(candidates) ? candidates : [candidates]
  if (range === 'latest') {
    // Allow older releases on the latest major when the newest is too fresh.
    const major = parse(candidates[0])[0]
    candidates = Object.keys(times).filter(
      (v) => /^\d+\.\d+\.\d+$/.test(v) && parse(v)[0] === major,
    )
  }
  const ok = candidates.filter((v) => /^\d+\.\d+\.\d+$/.test(v) && Date.parse(times[v]) < cutoff)
  if (ok.length === 0)
    throw new Error(`No release of ${name}@${range} is older than ${MIN_AGE_DAYS} days`)
  return ok.reduce((best, v) => (newer(v, best) ? v : best))
}

if (!args.has('--skip-build')) {
  run('pnpm', ['exec', 'turbo', 'run', 'build', ...PACKAGES.map((p) => `--filter=@glyphui/${p}`)], {
    cwd: root,
  })
}

const work = mkdtempSync(join(tmpdir(), 'glyph-consumer-'))
const tarballs = join(work, 'tarballs')
const app = join(work, 'app')
mkdirSync(tarballs)
console.log(`\nWorking in ${work}`)

const tarball = {}
for (const pkg of PACKAGES) {
  const before = new Set(readdirSync(tarballs))
  run('pnpm', ['pack', '--pack-destination', tarballs], { cwd: join(root, 'packages', pkg) })
  const file = readdirSync(tarballs).find((f) => !before.has(f))
  tarball[`@glyphui/${pkg}`] = `file:${join(tarballs, file)}`
}

const ui = JSON.parse(readFileSync(join(root, 'packages/ui/package.json'), 'utf8'))
const peers = Object.fromEntries(
  Object.entries(ui.peerDependencies).map(([name, range]) => [name, resolveVersion(name, range)]),
)
const tailwind = peers.tailwindcss
const tooling = {
  vite: resolveVersion('vite'),
  '@vitejs/plugin-react': resolveVersion('@vitejs/plugin-react'),
  typescript: resolveVersion('typescript'),
  '@types/react': resolveVersion('@types/react'),
  '@types/react-dom': resolveVersion('@types/react-dom'),
  '@tailwindcss/vite': resolveVersion('@tailwindcss/vite', tailwind),
}
const zod = resolveVersion('zod')

cpSync(join(here, 'template'), app, { recursive: true })
const { tailwindcss: _tw, ...runtimePeers } = peers
const manifest = {
  name: 'glyph-consumer',
  private: true,
  type: 'module',
  dependencies: { ...tarball, ...runtimePeers, zod },
  devDependencies: { ...tooling, tailwindcss: tailwind },
  // Packages depend on each other by version; point those at the local tarballs too.
  overrides: tarball,
}
writeFileSync(join(app, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('\nResolved versions:')
for (const [name, v] of Object.entries({
  ...runtimePeers,
  zod,
  tailwindcss: tailwind,
  ...tooling,
})) {
  console.log(`  ${name.padEnd(24)} ${v}`)
}

let ok = false
try {
  run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: app })
  run('npx', ['tsc', '-b'], { cwd: app })
  run('npx', ['vite', 'build', '--logLevel', 'warn'], { cwd: app })
  ok = true
  console.log('\nConsumer smoke test passed.')
} finally {
  if (ok && !args.has('--keep')) rmSync(work, { recursive: true, force: true })
  else console.log(`\nLeft the app at ${app} for inspection.`)
}
