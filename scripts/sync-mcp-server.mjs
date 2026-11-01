// Copies @glyphui/mcp's version into packages/mcp/server.json, the entry the official MCP
// Registry reads. Runs after `changeset version` (the root `version-packages` script), so the
// release PR bumps both together.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '../packages/mcp')
const { version } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
const file = join(dir, 'server.json')
const server = JSON.parse(readFileSync(file, 'utf8'))
server.version = version
for (const pkg of server.packages) pkg.version = version
writeFileSync(file, `${JSON.stringify(server, null, 2)}\n`)
