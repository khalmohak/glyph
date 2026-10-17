#!/usr/bin/env node
/**
 * Bundle-size budget for every public entry point.
 *
 * Each entry is bundled from the built `dist` with rolldown (the bundler inside Vite 8), minified,
 * with peer dependencies external and regular dependencies included, since users ship those. The
 * gzipped size is compared against `scripts/size-budget.json`; an entry more than 5% over
 * budget fails. `Button only` imports a single component to catch tree-shaking regressions.
 * Budgets cover code that loads up front; lazily imported chunks are listed but not budgeted.
 *
 * Usage: pnpm size            check against the budget (run `pnpm build` first)
 *        pnpm size --update   write current sizes as the new budget
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { rolldown } from 'rolldown'

const TOLERANCE = 0.05
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const budgetFile = join(root, 'scripts/size-budget.json')
const update = process.argv.includes('--update')

const pkgJson = (name) =>
  JSON.parse(readFileSync(join(root, 'packages', name, 'package.json'), 'utf8'))

/** Path of an export's built file, ignoring the source condition. */
function distFile(pkg, subpath) {
  const target = pkgJson(pkg).exports[subpath]
  const file = typeof target === 'string' ? target : (target.import ?? target.default)
  return join(root, 'packages', pkg, file)
}

const external = (pkg) => {
  const json = pkgJson(pkg)
  return [
    ...Object.keys(json.peerDependencies ?? {}),
    // Sibling Glyph packages are measured on their own.
    ...Object.keys(json.dependencies ?? {}).filter((d) => d.startsWith('@glyphui/')),
    'react/jsx-runtime',
  ]
}

const entries = [
  { name: '@glyphui/tokens', pkg: 'tokens', code: `export * from '${distFile('tokens', '.')}'` },
  { name: '@glyphui/ui', pkg: 'ui', code: `export * from '${distFile('ui', '.')}'` },
  {
    name: '@glyphui/ui (Button only)',
    pkg: 'ui',
    code: `export { Button } from '${distFile('ui', '.')}'`,
  },
  {
    name: '@glyphui/ui (Badge only)',
    pkg: 'ui',
    code: `export { Badge } from '${distFile('ui', '.')}'`,
  },
  {
    name: '@glyphui/ui (provider + Button)',
    pkg: 'ui',
    code: `export { GlyphProvider, Button } from '${distFile('ui', '.')}'`,
  },
  { name: '@glyphui/ui/form', pkg: 'ui', code: `export * from '${distFile('ui', './form')}'` },
  {
    name: '@glyphui/ui/data-table',
    pkg: 'ui',
    code: `export * from '${distFile('ui', './data-table')}'`,
  },
  { name: '@glyphui/ui/chart', pkg: 'ui', code: `export * from '${distFile('ui', './chart')}'` },
  { name: '@glyphui/blocks', pkg: 'blocks', code: `export * from '${distFile('blocks', '.')}'` },
  { name: '@glyphui/auth', pkg: 'auth', code: `export * from '${distFile('auth', '.')}'` },
  {
    name: '@glyphui/auth/rest',
    pkg: 'auth',
    code: `export * from '${distFile('auth', './rest')}'`,
  },
  {
    name: '@glyphui/auth/react-router',
    pkg: 'auth',
    code: `export * from '${distFile('auth', './react-router')}'`,
  },
  { name: '@glyphui/auth/ui', pkg: 'auth', code: `export * from '${distFile('auth', './ui')}'` },
  {
    name: '@glyphui/auth/ui (SignInForm only)',
    pkg: 'auth',
    code: `export { SignInForm } from '${distFile('auth', './ui')}'`,
  },
]

const scratch = mkdtempSync(join(tmpdir(), 'glyph-size-'))

async function measure({ pkg, code }, i) {
  // Entries import dist files by absolute path, so bare imports resolve from the package.
  const input = join(scratch, `entry-${i}.mjs`)
  writeFileSync(input, code)
  const deps = external(pkg)
  const bundle = await rolldown({
    input,
    platform: 'browser',
    external: (id) => deps.some((d) => id === d || id.startsWith(`${d}/`)),
    transform: { define: { 'process.env.NODE_ENV': '"production"' } },
    logLevel: 'silent',
  })
  const { output } = await bundle.generate({ format: 'esm', minify: true })
  await bundle.close()
  // Code behind dynamic import() loads later, only when used, so it is reported separately
  // and the budget applies to what loads up front.
  const chunks = output.filter((o) => o.type === 'chunk')
  const concat = (list) => list.map((o) => o.code).join('\n')
  const initial = concat(chunks.filter((o) => !o.isDynamicEntry))
  const lazy = concat(chunks.filter((o) => o.isDynamicEntry))
  return {
    min: Buffer.byteLength(initial),
    gzip: gzipSync(initial, { level: 9 }).length,
    lazy: lazy ? gzipSync(lazy, { level: 9 }).length : 0,
  }
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`
const budget = update ? {} : JSON.parse(readFileSync(budgetFile, 'utf8'))
const next = {}
let failed = false

console.log(
  `${'Entry'.padEnd(33)}${'min'.padStart(11)}${'gzip'.padStart(11)}${'budget'.padStart(11)}${'lazy gzip'.padStart(12)}`,
)
for (const [i, entry] of entries.entries()) {
  const size = await measure(entry, i)
  next[entry.name] = size.gzip
  const limit = budget[entry.name]
  const over = limit !== undefined && size.gzip > limit * (1 + TOLERANCE)
  if (over || (!update && limit === undefined)) failed = true
  const note = limit === undefined ? (update ? '' : '  no budget') : over ? '  OVER BUDGET' : ''
  console.log(
    `${entry.name.padEnd(33)}${kb(size.min).padStart(11)}${kb(size.gzip).padStart(11)}${(limit ? kb(limit) : '-').padStart(11)}${(size.lazy ? kb(size.lazy) : '-').padStart(12)}${note}`,
  )
}

rmSync(scratch, { recursive: true, force: true })

if (update) {
  writeFileSync(budgetFile, `${JSON.stringify(next, null, 2)}\n`)
  console.log(`\nWrote ${budgetFile}`)
} else if (failed) {
  console.error(
    `\nAn entry is more than ${TOLERANCE * 100}% over budget (or has none). If the growth is intended, run \`pnpm size --update\` and commit scripts/size-budget.json.`,
  )
  process.exit(1)
}
