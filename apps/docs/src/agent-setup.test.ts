import { describe, expect, it } from 'vitest'
import { AGENTS_BLOCK, agentTargets, setupPrompt } from './lib/agent-setup'

describe('setup prompts', () => {
  it('give every agent the setup guide and its instructions file', () => {
    for (const target of agentTargets) {
      const prompt = setupPrompt(target)
      expect(prompt).toContain('/docs/getting-started.md')
      expect(prompt).toContain(`to ${target.instructions}`)
      expect(prompt).toContain(AGENTS_BLOCK.split('\n')[2]?.slice(0, 40))
    }
  })

  it('connect the MCP server where the agent supports it', () => {
    for (const target of agentTargets) {
      expect(setupPrompt(target).includes('@glyphui/mcp')).toBe(Boolean(target.mcp))
    }
  })

  it('write valid JSON for the editors configured by file', () => {
    for (const target of agentTargets) {
      const json = target.mcp?.match(/`(\{.*\})`/)?.[1]
      if (json) expect(() => JSON.parse(json)).not.toThrow()
    }
  })
})
