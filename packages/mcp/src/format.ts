import type {
  Manifest,
  ManifestComponent,
  ManifestExample,
  ManifestGuide,
  ManifestProp,
} from './manifest'
import type { SearchHit } from './search'

const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ')

export const componentUrl = (m: Manifest, c: ManifestComponent) =>
  `${m.site.url}/components/${c.slug}`

/** The package a component's entry belongs to: `@glyphui/ui/form` → `@glyphui/ui`. */
export function packageOf(entry: string): string {
  return entry.split('/').slice(0, 2).join('/')
}

export function propsTable(name: string, props: ManifestProp[]): string {
  const rows = props.map(
    (p) =>
      `| \`${p.name}\`${p.required ? ' (required)' : ''} | \`${cell(p.type)}\` | ${p.defaultValue ? `\`${cell(p.defaultValue)}\`` : ''} | ${cell(p.description ?? '')} |`,
  )
  return [
    `### ${name} props`,
    '',
    '| Prop | Type | Default | Description |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n')
}

export function exampleBlock(example: ManifestExample): string {
  const lines = [
    `### ${example.kind === 'snippet' ? 'Snippet' : 'Example'}: ${example.title} (\`${example.file}\`)`,
  ]
  if (example.description) lines.push('', example.description)
  lines.push('', '```tsx', example.code, '```')
  return lines.join('\n')
}

/** The one-line list entry for a component. */
export function componentLine(c: ManifestComponent): string {
  const status = c.status === 'stable' ? '' : ` · ${c.status}`
  return `- **${c.name}** (\`${c.entry}\`${status}): ${c.description}`
}

/** Everything an agent needs to use a component correctly. */
export function componentMarkdown(
  m: Manifest,
  c: ManifestComponent,
  { examples = true }: { examples?: boolean } = {},
): string {
  const out = [`# ${c.name}`, '', c.description, '']
  out.push(
    `- Status: ${c.status}${c.added ? ` (since ${c.added})` : ''}`,
    `- Category: ${c.category}`,
    `- Docs: ${componentUrl(m, c)}`,
  )
  if (c.radix) out.push(`- Built on: ${c.radix}`)
  out.push('')
  if (c.status === 'planned') {
    out.push('Planned: not built yet. Suggest an existing component instead.')
    return out.join('\n')
  }

  const pkg = m.packages.find((p) => p.name === packageOf(c.entry))
  const named = c.exports.filter((e) => /^[A-Z]|^use/.test(e))
  out.push('## Install and import', '', '```sh', `npm install ${packageOf(c.entry)}`, '```')
  const required = (pkg?.peers ?? []).filter(
    (peer) => !peer.optional && !['react', 'react-dom', 'tailwindcss'].includes(peer.name),
  )
  if (required.length)
    out.push('', `Peer dependencies: ${required.map((p) => `\`${p.name}\``).join(', ')}.`)
  out.push(
    '',
    '```tsx',
    `import { ${(named.length ? named : [c.name]).slice(0, 8).join(', ')} } from '${c.entry}'`,
    '```',
  )
  const css = [
    '@glyphui/ui/styles.css',
    ...(pkg?.stylesheet && pkg.stylesheet !== '@glyphui/ui/styles.css' ? [pkg.stylesheet] : []),
  ]
  out.push(
    '',
    `CSS (once, after \`@import "tailwindcss";\`): ${css.map((s) => `\`@import "${s}";\``).join(' ')}`,
  )
  if (c.exports.length) out.push('', `Exports: ${c.exports.map((e) => `\`${e}\``).join(', ')}`)

  if (c.notes.length) out.push('', '## Notes', '', ...c.notes.map((n) => `- ${n}`))

  const propEntries = Object.entries(c.props)
  if (propEntries.length) {
    out.push('', '## Props')
    for (const [name, props] of propEntries) out.push('', propsTable(name, props))
  }

  if (c.styles.length) {
    out.push(
      '',
      '## Theming',
      '',
      'Restyle it for the whole app from the theme file, with typed slots and variants:',
    )
    for (const s of c.styles) {
      out.push('', `- \`${s.component}\` slots: ${s.slots.map((x) => `\`${x}\``).join(', ')}`)
      for (const [variant, values] of Object.entries(s.variants))
        out.push(
          `  - variant \`${variant}\`: ${values.map((v) => `\`${v}\``).join(' · ')}${s.defaultVariants[variant] ? ` (default \`${s.defaultVariants[variant]}\`)` : ''}`,
        )
    }
    const first = c.styles[0]
    if (first) {
      const variant = Object.entries(first.variants).find(([, values]) => values.length > 1)
      out.push(
        '',
        '```ts',
        `// glyph.theme.ts`,
        `defineTheme({`,
        `  name: 'acme',`,
        `  extends: presets.glyph,`,
        `  components: {`,
        `    ${first.component}: {`,
        ...(variant
          ? [`      defaultVariants: { ${variant[0]}: '${variant[1][1] ?? variant[1][0]}' },`]
          : []),
        `      className: { ${first.slots[0] ?? 'base'}: '…' },`,
        `    },`,
        `  },`,
        `})`,
        '```',
      )
    }
  }

  if (c.a11y && (c.a11y.keyboard.length || c.a11y.notes.length)) {
    out.push('', '## Accessibility')
    if (c.a11y.keyboard.length)
      out.push(
        '',
        '| Keys | Action |',
        '|---|---|',
        ...c.a11y.keyboard.map((k) => `| ${cell(k.keys)} | ${cell(k.action)} |`),
      )
    if (c.a11y.notes.length) out.push('', ...c.a11y.notes.map((n) => `- ${n}`))
  }

  if (c.examples.length) {
    out.push('', '## Examples')
    if (examples) for (const e of c.examples) out.push('', exampleBlock(e))
    else
      out.push(
        '',
        ...c.examples.map((e) => `- \`${e.file}\`: ${e.title}`),
        '',
        `Open one with \`get_example\` (component "${c.name}").`,
      )
  }
  return out.join('\n')
}

export function guideList(m: Manifest): string {
  const out = ['# Glyph guides', '']
  for (const g of m.guides)
    out.push(`- **${g.title}** (\`${g.slug}\`, ${g.section}): ${g.description}`)
  out.push('', 'Open one with `get_guide`.')
  return out.join('\n')
}

export function guideMarkdown(g: ManifestGuide): string {
  return g.markdown.trim()
}

export function hitsMarkdown(query: string, hits: SearchHit[]): string {
  if (hits.length === 0)
    return `No results for "${query}". Try fewer or different words, or \`list_components\`.`
  const out = [`# Results for "${query}"`, '']
  for (const h of hits) {
    const open =
      h.kind === 'component' || h.kind === 'prop'
        ? ` → \`get_component\` "${h.ref}"`
        : h.kind === 'guide'
          ? ` → \`get_guide\` "${h.ref}"`
          : ''
    out.push(`- [${h.kind}] **${h.title}**${open}`, `  ${h.snippet}`, `  ${h.url}`)
  }
  return out.join('\n')
}

/** Every guide and component in one document, like the site's llms-full.txt. */
export function fullMarkdown(m: Manifest): string {
  const parts = [
    `# Glyph ${m.version}`,
    '',
    'React 19 components on Tailwind CSS v4, themed by one typed theme file.',
    '',
    ...m.guides.map(guideMarkdown),
    ...m.components.filter((c) => c.status !== 'planned').map((c) => componentMarkdown(m, c)),
  ]
  return parts.join('\n\n---\n\n')
}
