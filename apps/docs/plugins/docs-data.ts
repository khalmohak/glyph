import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { withCustomConfig } from 'react-docgen-typescript'
import { codeToHtml, createCssVariablesTheme } from 'shiki'
import type { Plugin, ViteDevServer } from 'vite'

/**
 * Build-time data for the docs:
 * - `virtual:glyph-props`: prop tables for every component, extracted from @glyphui/ui's
 *   TypeScript source with react-docgen-typescript. Props inherited from React or Radix
 *   types are left out; the page links to Radix for those.
 * - `virtual:glyph-examples`: syntax-highlighted source of every example file. Colors are
 *   CSS variables, so highlighting follows the active Glyph theme.
 */

const PROPS_ID = 'virtual:glyph-props'
const EXAMPLES_ID = 'virtual:glyph-examples'

const theme = createCssVariablesTheme({
  name: 'glyph',
  variablePrefix: '--shiki-',
  fontStyle: true,
})

function walk(dir: string, filter: (file: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return walk(path, filter)
    return filter(path) ? [path] : []
  })
}

export interface PropDoc {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description?: string
}

function extractProps(uiRoot: string): Record<string, PropDoc[]> {
  const parser = withCustomConfig(join(uiRoot, 'tsconfig.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) =>
      prop.name !== 'key' && !(prop.parent?.fileName.includes('node_modules') ?? false),
  })
  const files = walk(join(uiRoot, 'src'), (f) => f.endsWith('.tsx') && !f.includes('.test'))
  const out: Record<string, PropDoc[]> = {}
  for (const doc of parser.parse(files)) {
    if (out[doc.displayName]) continue
    out[doc.displayName] = Object.values(doc.props)
      .map((p) => ({
        name: p.name,
        type: p.type.raw ?? p.type.name,
        required: p.required,
        ...(p.defaultValue?.value != null && { defaultValue: String(p.defaultValue.value) }),
        ...(p.description && { description: p.description }),
      }))
      .sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name))
  }
  return out
}

async function highlightExamples(
  contentRoot: string,
): Promise<Record<string, { code: string; html: string }>> {
  const files = walk(contentRoot, (f) => /\/examples\/[^/]+\.tsx$/.test(f))
  const entries = await Promise.all(
    files.map(async (file) => {
      const code = readFileSync(file, 'utf8').trim()
      const html = await codeToHtml(code, { lang: 'tsx', theme })
      const key = relative(contentRoot, file)
        .replace(/\\/g, '/')
        .replace('/examples/', '/')
        .replace(/\.tsx$/, '')
      return [key, { code, html }] as const
    }),
  )
  return Object.fromEntries(entries)
}

export function docsData(): Plugin {
  const uiRoot = resolve(__dirname, '../../../packages/ui')
  const contentRoot = resolve(__dirname, '../src/content')
  let props: Record<string, PropDoc[]> | null = null
  let server: ViteDevServer | undefined

  const invalidate = (id: string) => {
    const mod = server?.moduleGraph.getModuleById(`\0${id}`)
    if (mod) server?.reloadModule(mod)
  }

  return {
    name: 'glyph-docs-data',
    configureServer(s) {
      server = s
      s.watcher.add([join(uiRoot, 'src'), contentRoot])
      s.watcher.on('change', (file) => {
        if (file.startsWith(join(uiRoot, 'src')) && file.endsWith('.tsx')) {
          props = null
          invalidate(PROPS_ID)
        }
        if (file.startsWith(contentRoot) && file.includes('/examples/')) invalidate(EXAMPLES_ID)
      })
    },
    resolveId(id) {
      if (id === PROPS_ID || id === EXAMPLES_ID) return `\0${id}`
    },
    async load(id) {
      if (id === `\0${PROPS_ID}`) {
        props ??= extractProps(uiRoot)
        return `export default ${JSON.stringify(props)}`
      }
      if (id === `\0${EXAMPLES_ID}`) {
        return `export default ${JSON.stringify(await highlightExamples(contentRoot))}`
      }
    },
  }
}
