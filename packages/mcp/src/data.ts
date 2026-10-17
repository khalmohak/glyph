import { readFileSync } from 'node:fs'
import type { Manifest } from './manifest'

let cached: Manifest | undefined

/**
 * The manifest shipped with the package (`data/manifest.json`, generated at build time).
 * Read once, on first use.
 */
export function loadManifest(): Manifest {
  cached ??= JSON.parse(
    readFileSync(new URL('../data/manifest.json', import.meta.url), 'utf8'),
  ) as Manifest
  return cached
}
