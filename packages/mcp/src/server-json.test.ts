import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (file: string) =>
  JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'))

// server.json is what the official MCP Registry lists; it must name this package and version.
describe('server.json', () => {
  const pkg = read('package.json')
  const server = read('server.json')

  it('matches package.json', () => {
    expect(server.name).toBe(pkg.mcpName)
    expect(server.version).toBe(pkg.version)
    expect(server.packages).toEqual([
      expect.objectContaining({ identifier: pkg.name, version: pkg.version, registryType: 'npm' }),
    ])
  })

  it('fits the registry description limit', () => {
    expect(server.description.length).toBeLessThanOrEqual(100)
  })
})
