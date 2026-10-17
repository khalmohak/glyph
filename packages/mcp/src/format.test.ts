import { describe, expect, it } from 'vitest'
import {
  componentLine,
  componentMarkdown,
  exampleBlock,
  fullMarkdown,
  guideList,
  hitsMarkdown,
  packageOf,
  propsTable,
} from './format'
import { setupMarkdown } from './setup'
import { fixture } from './test/fixture'
import { themingMarkdown } from './theming'

const [button, dataTable, hero, carousel] = fixture.components as [
  (typeof fixture.components)[0],
  (typeof fixture.components)[0],
  (typeof fixture.components)[0],
  (typeof fixture.components)[0],
]

describe('packageOf', () => {
  it('drops the subpath', () => {
    expect(packageOf('@glyphui/ui/data-table')).toBe('@glyphui/ui')
    expect(packageOf('@glyphui/blocks')).toBe('@glyphui/blocks')
  })
})

describe('propsTable', () => {
  it('marks required props, shows defaults and escapes pipes', () => {
    const table = propsTable('IconButton', button.props.IconButton ?? [])
    expect(table).toContain('| `aria-label` (required) | `string` |  | A \\| B |')
    const withDefault = propsTable('Button', button.props.Button ?? [])
    expect(withDefault).toContain('| `variant` | `"primary" \\| "ghost"` |  | Look |')
    expect(withDefault).toContain('| `loading` | `boolean` | `false` |  |')
  })
})

describe('exampleBlock', () => {
  it('labels examples and snippets', () => {
    expect(exampleBlock(button.examples[1]!)).toBe(
      '### Example: Loading (`loading`)\n\nShows a spinner.\n\n```tsx\n<Button loading />\n```',
    )
    expect(exampleBlock(dataTable.examples[0]!)).toMatch(/^### Snippet: Server mode/)
  })
})

describe('componentLine', () => {
  it('shows the entry and a non-stable status', () => {
    expect(componentLine(button)).toBe('- **Button** (`@glyphui/ui`): Triggers an action.')
    expect(componentLine(dataTable)).toContain('(`@glyphui/ui/data-table` · beta)')
  })
})

describe('componentMarkdown', () => {
  const md = componentMarkdown(fixture, button)

  it('covers install, import, props, theming, accessibility and examples', () => {
    expect(md).toContain('# Button\n\nTriggers an action.')
    expect(md).toContain('- Status: stable (since 0.2.0)')
    expect(md).toContain('- Docs: https://glyph.test/components/button')
    expect(md).toContain("import { Button, IconButton } from '@glyphui/ui'")
    expect(md).toContain('`@import "@glyphui/ui/styles.css";`')
    expect(md).toContain('- Defaults to type="button".')
    expect(md).toContain('### Button props')
    expect(md).toContain('### IconButton props')
    expect(md).toContain('- `Button` slots: `base`, `icon`')
    expect(md).toContain('variant `variant`: `primary` · `ghost` (default `primary`)')
    expect(md).toContain("defaultVariants: { variant: 'ghost' },")
    expect(md).toContain('| Enter or Space | Activates it. |')
    expect(md).toContain('```tsx\n<Button loading />\n```')
    // React itself is not listed as a peer to install.
    expect(md).not.toContain('Peer dependencies')
  })

  it('lists examples without code when asked', () => {
    const short = componentMarkdown(fixture, button, { examples: false })
    expect(short).toContain('- `loading`: Loading')
    expect(short).toContain('Open one with `get_example` (component "Button").')
    expect(short).not.toContain('<Button loading />')
  })

  it("adds the package's stylesheet and required Glyph peers", () => {
    const block = componentMarkdown(fixture, hero)
    expect(block).toContain('npm install @glyphui/blocks')
    expect(block).toContain('Peer dependencies: `@glyphui/ui`.')
    expect(block).toContain('`@import "@glyphui/blocks/styles.css";`')
  })

  it('names the library a component is built on', () => {
    expect(componentMarkdown(fixture, dataTable)).toContain('- Built on: TanStack Table')
  })

  it('says planned components do not exist yet', () => {
    const planned = componentMarkdown(fixture, carousel)
    expect(planned).toContain('Planned: not built yet.')
    expect(planned).not.toContain('npm install')
  })
})

describe('guides and search results', () => {
  it('lists guides with slugs', () => {
    expect(guideList(fixture)).toContain(
      '- **Data tables** (`data-tables`, Building apps): Sorting, filters and server mode.',
    )
  })

  it('formats hits with how to open each one', () => {
    const md = hitsMarkdown('x', [
      { kind: 'component', title: 'Button', url: 'u1', snippet: 's1', ref: 'Button', score: 2 },
      { kind: 'guide', title: 'Theming', url: 'u2', snippet: 's2', ref: 'theming', score: 1 },
      { kind: 'changelog', title: '1.0.0: x', url: 'u3', snippet: 's3', score: 0.5 },
    ])
    expect(md).toContain('- [component] **Button** → `get_component` "Button"\n  s1\n  u1')
    expect(md).toContain('- [guide] **Theming** → `get_guide` "theming"')
    expect(md).toContain('- [changelog] **1.0.0: x**\n')
    expect(hitsMarkdown('nothing', [])).toMatch(/^No results for "nothing"/)
  })

  it('joins guides and live components into one document', () => {
    const full = fullMarkdown(fixture)
    expect(full).toMatch(/^# Glyph 1\.2\.3/)
    expect(full).toContain('# Data tables')
    expect(full).toContain('# HeroSection')
    expect(full).not.toContain('# Carousel')
  })
})

describe('setupMarkdown', () => {
  it('installs ui with Vite and react-router by default', () => {
    const md = setupMarkdown(fixture, { framework: 'vite' })
    expect(md).toContain('# Set up Glyph 1.2.3 with Vite')
    expect(md).toContain('npm install @glyphui/ui react-router\n')
    expect(md).toContain('npm install -D tailwindcss @tailwindcss/vite')
    expect(md).toContain("glyphColorMode({ defaultMode: 'system' })")
    expect(md).toContain('router={reactRouter} toaster')
    expect(md).toContain('<RouterProvider router={router} />')
    expect(md).not.toContain('@glyphui/blocks/styles.css')
    expect(md).not.toContain('AuthProvider client')
  })

  it("resolves auth's Glyph peers and orders the CSS and providers", () => {
    const md = setupMarkdown(fixture, {
      framework: 'vite',
      packages: ['ui', 'auth', 'viewers'],
      features: ['forms', 'data-table'],
    })
    expect(md).toContain(
      'npm install @glyphui/ui @glyphui/auth @glyphui/viewers @glyphui/blocks @glyphui/tokens react-hook-form @hookform/resolvers zod @tanstack/react-table@8 react-router',
    )
    const css = ['ui/styles.css', 'blocks/styles.css', 'auth/styles.css', 'viewers/styles.css']
    const positions = css.map((file) => md.indexOf(`@import "@glyphui/${file}"`))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
    expect(md).toContain('| `@glyphui/viewers/pdf` | PdfViewer | `pdfjs-dist` |')
    expect(md).toContain('loader: protectedLoader(auth)')
    const tree = [
      '<GlyphProvider',
      '<AuthProvider client={auth}>',
      '<RouterProvider',
      '<SessionExpiredDialog />',
    ]
    const order = tree.map((tag) => md.indexOf(tag))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('uses ColorModeScript and a client Providers component for Next.js', () => {
    const md = setupMarkdown(fixture, { framework: 'next', packages: ['auth'] })
    expect(md).toContain('npm install -D tailwindcss @tailwindcss/postcss')
    expect(md).toContain('<ColorModeScript defaultMode="system" />')
    expect(md).toContain("'use client'")
    expect(md).toContain('export function Providers')
    expect(md).toContain("import theme from '../glyph.theme'")
    expect(md).not.toContain('createRoot')
    expect(md).not.toContain('react-router')
    expect(md).toContain('<SessionExpiredDialog />')
  })

  it('renders an App without a router', () => {
    const md = setupMarkdown(fixture, { framework: 'other', router: 'none' })
    expect(md).toContain('## 3. Color mode')
    expect(md).toContain('    <App />')
    expect(md).not.toContain('router={reactRouter}')
  })
})

describe('themingMarkdown', () => {
  it('lists presets, tokens and a complete theme', () => {
    const md = themingMarkdown(fixture)
    expect(md).toContain(
      '- `presets.glyph`: Precise. Primary blue (light) / lightblue (dark); sans "Geist Variable"; radius md 8px; motion subtle.',
    )
    expect(md).toContain('radius md ?; recipes for Button.')
    expect(md).toContain('`colors.light` / `colors.dark`: `background`, `primary`.')
    expect(md).toContain('`level` (`none`, `subtle`)')
    expect(md).toContain('export default defineTheme({')
    expect(md).toContain('https://glyph.test/themes')
  })
})
