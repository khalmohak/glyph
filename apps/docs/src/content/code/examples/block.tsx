import { CodeBlock } from '@glyphui/ui'

const code = `import { defineTheme, presets } from '@glyphui/ui'

export default defineTheme({
  name: 'acme',
  extends: presets.glyph,
  radius: { md: '6px' },
})`

export default function Example() {
  return (
    <div className="grid gap-4">
      <CodeBlock title="glyph.theme.ts" code={code} />
      <CodeBlock code="pnpm add @glyphui/ui" />
    </div>
  )
}
