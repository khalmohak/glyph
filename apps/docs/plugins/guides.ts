import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { createProcessor } from '@mdx-js/mdx'
import type { Code, Heading, Nodes, Root } from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import { codeToHtml, createCssVariablesTheme } from 'shiki'
import { parse as parseYaml } from 'yaml'
import { createSlugger } from '../src/lib/slug'

/**
 * Guides are MDX files in src/guides with YAML frontmatter. This module reads them in Node
 * (for the guide index, search, prerendered titles and the Markdown exports) and provides
 * the remark plugin the MDX build uses, so heading ids and code blocks match everywhere.
 */

export const guideSections = ['Foundations', 'Building apps', 'Shipping'] as const
export type GuideSection = (typeof guideSections)[number]

export interface GuideHeading {
  depth: 2 | 3
  text: string
  id: string
}

export interface GuideInfo {
  slug: string
  title: string
  description: string
  order: number
  section: GuideSection
  headings: GuideHeading[]
}

export const codeTheme = createCssVariablesTheme({
  name: 'glyph',
  variablePrefix: '--shiki-',
  fontStyle: true,
})

/** Plain text of a heading, the same way for ids, the table of contents and search. */
export function nodeText(node: Nodes): string {
  if ('value' in node && typeof node.value === 'string' && node.type !== 'yaml') return node.value
  if ('children' in node) return (node.children as Nodes[]).map(nodeText).join('')
  return ''
}

/** `title="src/main.tsx" check` → { title: 'src/main.tsx', check: true } */
export function parseCodeMeta(meta: string | null | undefined): Record<string, string | true> {
  const out: Record<string, string | true> = {}
  for (const match of (meta ?? '').matchAll(/(\w+)(?:="([^"]*)")?/g)) {
    out[match[1] as string] = match[2] ?? true
  }
  return out
}

function walk(node: Nodes, visit: (node: Nodes, index: number, parent: Nodes | null) => void) {
  const recurse = (current: Nodes, parent: Nodes | null, index: number) => {
    visit(current, index, parent)
    if ('children' in current)
      (current.children as Nodes[]).forEach((child, i) => {
        recurse(child, current, i)
      })
  }
  recurse(node, null, 0)
}

const shellLangs = new Set(['sh', 'bash', 'shell', 'zsh'])

/**
 * Heading ids (`## Install` → `id="install"`) and code fences rendered by shiki into a
 * `<CodeBlock>` element with the raw code, its language and optional file title.
 */
export function remarkGuide() {
  return async (tree: Root) => {
    const slug = createSlugger()
    const blocks: { node: Code; parent: Nodes; index: number }[] = []
    walk(tree, (node, index, parent) => {
      if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
        const id = slug(nodeText(node))
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } }
      }
      if (node.type === 'code' && parent) blocks.push({ node, parent, index })
    })
    await Promise.all(
      blocks.map(async ({ node, parent }) => {
        const lang = node.lang ?? 'text'
        const meta = parseCodeMeta(node.meta)
        const html = await codeToHtml(node.value, {
          lang: shellLangs.has(lang) ? 'shellscript' : lang,
          theme: codeTheme,
        }).catch(() => codeToHtml(node.value, { lang: 'text', theme: codeTheme }))
        const attrs = [
          { type: 'mdxJsxAttribute', name: 'html', value: html },
          { type: 'mdxJsxAttribute', name: 'code', value: node.value },
          { type: 'mdxJsxAttribute', name: 'lang', value: lang },
          ...(typeof meta.title === 'string'
            ? [{ type: 'mdxJsxAttribute', name: 'title', value: meta.title }]
            : []),
        ]
        const element = {
          type: 'mdxJsxFlowElement',
          name: 'CodeBlock',
          attributes: attrs,
          children: [],
        }
        const siblings = (parent as { children: unknown[] }).children
        siblings[siblings.indexOf(node)] = element
      }),
    )
  }
}

const parser = createProcessor({ remarkPlugins: [remarkFrontmatter, remarkGfm] })

/** Parses one guide's frontmatter and headings, with the same ids the page renders. */
export function readGuide(file: string): GuideInfo {
  const source = readFileSync(file, 'utf8')
  const tree = parser.parse(source) as Root
  const yaml = tree.children.find((node) => node.type === 'yaml')
  if (yaml?.type !== 'yaml') throw new Error(`${basename(file)}: missing frontmatter`)
  const data = parseYaml(yaml.value) as Partial<Omit<GuideInfo, 'slug' | 'headings'>>
  for (const key of ['title', 'description', 'order', 'section'] as const) {
    if (data[key] === undefined) throw new Error(`${basename(file)}: frontmatter needs ${key}`)
  }
  if (!guideSections.includes(data.section as GuideSection))
    throw new Error(`${basename(file)}: section must be one of ${guideSections.join(', ')}`)
  const slug = createSlugger()
  const headings: GuideHeading[] = []
  walk(tree, (node) => {
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      const text = nodeText(node as Heading)
      headings.push({ depth: node.depth, text, id: slug(text) })
    }
  })
  return {
    slug: basename(file, '.mdx'),
    title: String(data.title),
    description: String(data.description),
    order: Number(data.order),
    section: data.section as GuideSection,
    headings,
  }
}

export function readGuides(dir: string): GuideInfo[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => readGuide(join(dir, file)))
    .sort((a, b) => a.order - b.order)
}

export interface CodeSnippet {
  guide: string
  index: number
  lang: string
  title?: string
  check: boolean
  code: string
}

/** Every fenced code block in a guide, with its meta (for type-checking `check` blocks). */
export function guideCodeBlocks(file: string): CodeSnippet[] {
  const tree = parser.parse(readFileSync(file, 'utf8')) as Root
  const out: CodeSnippet[] = []
  walk(tree, (node) => {
    if (node.type !== 'code') return
    const meta = parseCodeMeta(node.meta)
    out.push({
      guide: basename(file, '.mdx'),
      index: out.length,
      lang: node.lang ?? 'text',
      ...(typeof meta.title === 'string' && { title: meta.title }),
      check: meta.check === true,
      code: node.value,
    })
  })
  return out
}
