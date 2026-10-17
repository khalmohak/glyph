# @glyphui/mcp

An [MCP](https://modelcontextprotocol.io) server for [Glyph](https://github.com/khalmohak/glyph). It lets Claude Code, Cursor, VS Code, Windsurf and other AI coding agents look up Glyph's components, props, examples, setup and theming before they write code, so they use the real API instead of guessing.

[Docs](https://glyphui.xyz/docs/ai) · [Components](https://glyphui.xyz/components) · [GitHub](https://github.com/khalmohak/glyph)

Everything it serves ships inside the package and matches the Glyph version you install. It makes no network requests.

## Set up

Claude Code:

```sh
claude mcp add glyph -- npx -y @glyphui/mcp
```

Cursor (`.cursor/mcp.json`), Windsurf (`~/.codeium/windsurf/mcp_config.json`) and Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "glyph": { "command": "npx", "args": ["-y", "@glyphui/mcp"] }
  }
}
```

VS Code (`.vscode/mcp.json`):

```json
{
  "servers": {
    "glyph": { "type": "stdio", "command": "npx", "args": ["-y", "@glyphui/mcp"] }
  }
}
```

To match the Glyph version in your project, pin it: `npx -y @glyphui/mcp@0.9.0`, or add `@glyphui/mcp` as a dev dependency and run `glyphui-mcp`.

## Tools

| Tool | What it returns |
|---|---|
| `list_components` | Components by category, with import entry and status. Filters: `category`, `status`, `package`, `query`. |
| `get_component` | Install and import, peer dependencies, CSS, props for each export, theme slots and variants, keyboard behavior and examples. Takes a name, slug or export. |
| `get_example` | One example's full source, or the list of a component's examples. |
| `search_docs` | Ranked results across components, props, guide sections and release notes. |
| `list_guides`, `get_guide` | The guides (forms, data tables, auth, routing, testing and more) as Markdown. |
| `get_setup` | Install commands, CSS imports, color-mode setup, a theme file and the provider tree for Vite, Next.js or other setups. |
| `get_theming` | Presets, every token a theme sets, per-component overrides and a complete theme file. |

Resources: `glyph://llms-full` (all docs in one document), `glyph://components/{slug}` and `glyph://guides/{slug}`. Prompt: `build-with-glyph`.

## Use it from code

```ts
import { createGlyphServer } from '@glyphui/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

await createGlyphServer().connect(new StdioServerTransport())
```

The data is also available as JSON: `@glyphui/mcp/manifest.json`.

## License

MIT
