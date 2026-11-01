# @glyphui/mcp

## 0.9.0

### Minor Changes

- [#38](https://github.com/khalmohak/glyph/pull/38) [`0eb5f45`](https://github.com/khalmohak/glyph/commit/0eb5f4512a10c07d70b65d3c5b63f5001155b717) Thanks [@khalmohak](https://github.com/khalmohak)! - New package: `@glyphui/mcp`, an MCP server that gives Claude Code, Cursor, VS Code, Windsurf and Claude Desktop Glyph's components, props, examples, guides, setup and theming, so agents use the real API instead of guessing. Run it with `npx -y @glyphui/mcp`; setup for each editor is in the new [Use with AI](https://glyphui.xyz/docs/ai) guide. The data is generated from the docs at build time and ships in the package, so answers match the installed Glyph version and need no network.

### Patch Changes

- [#42](https://github.com/khalmohak/glyph/pull/42) [`f576405`](https://github.com/khalmohak/glyph/commit/f576405d882b0d57679d91311edabf50d848bd36) Thanks [@khalmohak](https://github.com/khalmohak)! - npm descriptions and keywords for AI coding agents. `@glyphui/mcp` declares `mcpName` (`io.github.khalmohak/glyph`) and ships a `server.json`, so it can be listed in the official MCP Registry.
