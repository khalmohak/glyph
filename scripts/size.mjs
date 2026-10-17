#!/usr/bin/env node
/**
 * Bundle-size budget for every public entry point.
 *
 * Each entry is bundled from the built `dist` with rolldown (the bundler inside Vite 8), minified,
 * with peer dependencies external and regular dependencies included, since users ship those. The
 * gzipped size is compared against `scripts/size-budget.json`; an entry more than 5% over
 * budget fails. `Button only` imports a single component to catch tree-shaking regressions.
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
  { name: '@glyphui/ui/form', pkg: 'ui', code: `export * from '${distFile('ui', './form')}'` },
  {
    name: '@glyphui/ui/data-table',
    pkg: 'ui',
    code: `export * from '${distFile('ui', './data-table')}'`,
  },
  { name: '@glyphui/ui/chart', pkg: 'ui', code: `export * from '${distFile('ui', './chart')}'` },
  { name: '@glyphui/blocks', pkg: 'blocks', code: `export * from '${distFile('blocks', '.')}'` },
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
  const js = output
    .filter((o) => o.type === 'chunk')
    .map((o) => o.code)
    .join('\n')
  return { min: Buffer.byteLength(js), gzip: gzipSync(js, { level: 9 }).length }
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`
const budget = update ? {} : JSON.parse(readFileSync(budgetFile, 'utf8'))
const next = {}
let failed = false

console.log(
  `${'Entry'.padEnd(30)}${'min'.padStart(11)}${'gzip'.padStart(11)}${'budget'.padStart(11)}`,
)
for (const [i, entry] of entries.entries()) {
  const size = await measure(entry, i)
  next[entry.name] = size.gzip
  const limit = budget[entry.name]
  const over = limit !== undefined && size.gzip > limit * (1 + TOLERANCE)
  if (over || (!update && limit === undefined)) failed = true
  const note = limit === undefined ? (update ? '' : '  no budget') : over ? '  OVER BUDGET' : ''
  console.log(
    `${entry.name.padEnd(30)}${kb(size.min).padStart(11)}${kb(size.gzip).padStart(11)}${(limit ? kb(limit) : '-').padStart(11)}${note}`,
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
