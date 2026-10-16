# @glyphui/tokens

The framework-free theme engine behind [Glyph](https://github.com/khalmohak/glyph). It holds a typed token schema, `defineTheme` with `extends`, CSS custom property output for light and dark mode, and four presets.

Most apps should install [`@glyphui/ui`](https://www.npmjs.com/package/@glyphui/ui), which re-exports everything here. Use this package directly when you only need the CSS variables, for example in a non-React app or a build script.

```sh
npm install @glyphui/tokens
```

```ts
import { defineTheme, presets, themeToCss, tokenVar } from '@glyphui/tokens'

const theme = defineTheme({
  name: 'acme',
  extends: presets.glyph,
  colors: { dark: { primary: 'oklch(70% 0.19 45)' } },
})

themeToCss(theme)
// :root { --glyph-primary: ...; --glyph-radius-md: ...; ... }
// [data-mode="dark"] { ... }

themeToCss(theme, { selector: '[data-glyph-theme="acme"]' }) // scoped to a subtree
tokenVar('primary') // 'var(--glyph-primary)'
```

Color mode comes from a `data-mode="light|dark"` attribute on any ancestor. Without it, the root theme follows `prefers-color-scheme`.

## License

MIT
