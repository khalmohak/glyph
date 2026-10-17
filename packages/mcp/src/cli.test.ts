import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { describe, expect, it } from 'vitest'

const bin = fileURLToPath(new URL('../dist/cli.js', import.meta.url))

// Runs the built bin the way an editor does: `npx -y @glyphui/mcp` over stdio.
describe('glyphui-mcp (stdio)', () => {
  it('is built (turbo runs build before test)', () => {
    expect(existsSync(bin), `${bin} is missing; run the build first`).toBe(true)
  })

  it('answers initialize, tools/list and a tool call', async () => {
    const client = new Client({ name: 'smoke', version: '0.0.0' })
    await client.connect(
      new StdioClientTransport({ command: process.execPath, args: [bin], stderr: 'pipe' }),
    )
    try {
      expect(client.getServerVersion()?.name).toBe('glyph')
      const { tools } = await client.listTools()
      expect(tools).toHaveLength(8)
      const result = (await client.callTool({
        name: 'search_docs',
        arguments: { query: 'server side pagination', limit: 1 },
      })) as { content: { text: string }[] }
      expect(result.content[0]?.text).toContain('Data tables › Server mode')
    } finally {
      await client.close()
    }
  }, 20_000)
})
