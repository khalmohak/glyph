import type { HighlighterCore } from 'shiki/core'

export interface CodeToken {
  content: string
  /** A CSS color, e.g. `var(--shiki-token-keyword)`. */
  color?: string
  /** Bit flags: 1 italic, 2 bold, 4 underline. */
  fontStyle?: number
}

const THEME = 'glyph'
let highlighter: Promise<HighlighterCore> | undefined
const loaded = new Set<string>()

/** File extensions and common aliases mapped to Shiki language ids. */
const aliases: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  sh: 'bash',
  zsh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
  htm: 'html',
  kt: 'kotlin',
  cs: 'csharp',
  'c++': 'cpp',
  hpp: 'cpp',
  h: 'c',
  dockerfile: 'docker',
  tf: 'hcl',
  text: 'plaintext',
  txt: 'plaintext',
}

/** Normalizes a language name or file extension to a Shiki language id. */
export function resolveLanguage(lang: string | undefined): string {
  const key = (lang ?? 'plaintext').toLowerCase().replace(/^\./, '')
  return Object.hasOwn(aliases, key) ? (aliases[key] as string) : key
}

/** Guesses a language from a file name, e.g. `reminders.ts` → `typescript`. */
export function languageFromFileName(name: string | undefined): string | undefined {
  if (!name) return undefined
  const lower = name.toLowerCase()
  if (lower === 'dockerfile') return 'docker'
  const ext = lower.split('.').pop()
  return ext && ext !== lower ? resolveLanguage(ext) : undefined
}

async function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= (async () => {
    const [{ createHighlighterCore, createCssVariablesTheme }, { createJavaScriptRegexEngine }] =
      await Promise.all([import('shiki/core'), import('shiki/engine/javascript')])
    return createHighlighterCore({
      themes: [
        createCssVariablesTheme({ name: THEME, variablePrefix: '--shiki-', fontStyle: true }),
      ],
      langs: [],
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
  })()
  return highlighter
}

/**
 * Highlights code into lines of tokens colored with CSS variables (`--shiki-token-*`),
 * which Glyph's viewers stylesheet maps to theme colors. Grammars load on first use; unknown
 * languages render as plain text.
 */
export async function highlightCode(
  code: string,
  lang: string | undefined,
): Promise<CodeToken[][]> {
  const id = resolveLanguage(lang)
  const plain = () => code.split('\n').map((line) => [{ content: line }])
  if (id === 'plaintext') return plain()
  let tokens: Awaited<ReturnType<HighlighterCore['codeToTokens']>>['tokens']
  try {
    const shiki = await getHighlighter()
    if (!loaded.has(id)) {
      const { bundledLanguages } = await import('shiki/langs')
      const table = bundledLanguages as Record<string, (() => Promise<unknown>) | undefined>
      const load = Object.hasOwn(table, id) ? table[id] : undefined
      if (!load) return plain()
      await shiki.loadLanguage(load as never)
      loaded.add(id)
    }
    tokens = shiki.codeToTokens(code, { lang: id, theme: THEME }).tokens
  } catch {
    // A grammar or the highlighter failed to load (offline, bad chunk): show plain text,
    // and let the next call try again instead of reusing a failed highlighter.
    highlighter = undefined
    loaded.clear()
    return plain()
  }
  return tokens.map((line) =>
    line.map((token) => ({
      content: token.content,
      ...(token.color && { color: token.color }),
      ...(token.fontStyle && { fontStyle: token.fontStyle }),
    })),
  )
}
