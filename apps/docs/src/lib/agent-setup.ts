import { LIVE_URL } from './site'

/**
 * Copy-paste setup prompts, one per coding agent: install Glyph, connect the MCP server and
 * add the project instructions. Plain data, so the docs pages and the Markdown exports
 * (plugins/llms.ts) share the same text.
 */

export interface AgentTarget {
  id: string
  label: string
  /** The file the agent reads project instructions from. */
  instructions: string
  /** How this agent connects the MCP server, as a prompt step; none for agents without MCP. */
  mcp?: string
}

const jsonConfig = (file: string, key: 'mcpServers' | 'servers', stdio = false) =>
  `Add Glyph's MCP server to \`${file}\`, merging with any servers already there: \`${JSON.stringify(
    {
      [key]: {
        glyph: { ...(stdio && { type: 'stdio' }), command: 'npx', args: ['-y', '@glyphui/mcp'] },
      },
    },
  )}\`.`

export const agentTargets: readonly AgentTarget[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    instructions: 'CLAUDE.md',
    mcp: "Add Glyph's MCP server for this project: run `claude mcp add --scope project glyph -- npx -y @glyphui/mcp`.",
  },
  {
    id: 'cursor',
    label: 'Cursor',
    instructions: 'AGENTS.md',
    mcp: jsonConfig('.cursor/mcp.json', 'mcpServers'),
  },
  {
    id: 'vscode',
    label: 'VS Code',
    instructions: 'AGENTS.md',
    mcp: jsonConfig('.vscode/mcp.json', 'servers', true),
  },
  {
    id: 'codex',
    label: 'Codex',
    instructions: 'AGENTS.md',
    mcp: 'Add Glyph\'s MCP server to `~/.codex/config.toml`, keeping what\'s there: a `[mcp_servers.glyph]` table with `command = "npx"` and `args = ["-y", "@glyphui/mcp"]`.',
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    instructions: 'AGENTS.md',
    mcp: jsonConfig('~/.codeium/windsurf/mcp_config.json', 'mcpServers'),
  },
  { id: 'other', label: 'Other', instructions: 'AGENTS.md' },
]

/** The block the prompt adds to the project's instructions file; also shown on the home page. */
export const AGENTS_BLOCK = `## UI

This app uses Glyph (@glyphui/ui and friends) for all UI. Before using a component, look it up with the glyph MCP server (get_component, search_docs) or at ${LIVE_URL}/llms.txt. Don't guess props.

- Import from the entry each component lists, such as @glyphui/ui/form.
- Style through the theme file and token utilities (bg-primary, text-muted-foreground), not hard-coded colors.
- Prefer an existing block or pattern over building from primitives.
- Keep labels, aria-label on icon-only buttons, and keyboard behavior.`

export function setupPrompt(target: AgentTarget): string {
  const steps = [
    'If there is no React app here yet, create one with Vite (React + TypeScript) first.',
    ...(target.mcp ? [target.mcp] : []),
    target.mcp
      ? `Install and wire up Glyph. If the glyph MCP tools are available, call \`get_setup\` for this project's framework and follow it. Otherwise (they load after a restart) follow ${LIVE_URL}/docs/getting-started.md. That means: install @glyphui/ui, add its CSS imports, create the theme file and wrap the app in GlyphProvider.`
      : `Install and wire up Glyph by following ${LIVE_URL}/docs/getting-started.md: install @glyphui/ui, add its CSS imports, create the theme file and wrap the app in GlyphProvider. ${LIVE_URL}/llms.txt indexes every component and guide as Markdown.`,
    `Add this section to ${target.instructions} at the project root, creating the file if needed:\n\n${AGENTS_BLOCK.split(
      '\n',
    )
      .map((line) => (line ? `   ${line}` : ''))
      .join('\n')}`,
    'Run the app (or its build) to check it works, then tell me what you changed.',
  ]
  return [
    `Set up Glyph (${LIVE_URL}), a React + Tailwind CSS v4 UI library, in this project.`,
    '',
    ...steps.map((step, i) => `${i + 1}. ${step}`),
  ].join('\n')
}
