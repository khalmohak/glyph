<div align="center">

# Glyph

**One theme file. Every screen follows.**

React components on Tailwind CSS v4 that take their whole look from one typed theme, with the parts every app rebuilds (forms, data tables, app layout, loading / empty / error states) already solved.

[![CI](https://github.com/khalmohak/glyph/actions/workflows/ci.yml/badge.svg)](https://github.com/khalmohak/glyph/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@glyphui/ui?label=%40glyphui%2Fui)](https://www.npmjs.com/package/@glyphui/ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[Live showcase](https://khalmohak.github.io/glyph/) · [Contributing](./CONTRIBUTING.md) · [Changelog](./packages/ui/CHANGELOG.md)

</div>

## Install

```sh
pnpm add @glyphui/ui
# optional, for the form and data-table patterns
pnpm add react-hook-form @hookform/resolvers zod @tanstack/react-table
```

```css
/* index.css */
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
```

## One theme file

```ts
// glyph.theme.ts
import { defineTheme, presets } from '@glyphui/ui'

export default defineTheme({
  name: 'acme',
  extends: presets.glyph,                // or brutalist, editorial, playful
  colors: { dark: { primary: 'oklch(70% 0.19 45)' } },
  radius: { md: '6px' },
  components: {
    Button: { defaultVariants: { size: 'lg' } },   // typed: 'sm' | 'md' | 'lg'
  },
})
```

```tsx
// main.tsx
import { GlyphProvider } from '@glyphui/ui'
import theme from './glyph.theme'

createRoot(root).render(
  <GlyphProvider theme={theme}>
    <App />
  </GlyphProvider>,
)
```

A theme sets color (per light and dark mode), typography (a nine-step scale with size, line height, tracking and weight), radius, shadows, border width, motion and control density, plus per-component defaults and classes. Every option is type-checked.

## Solved patterns

```tsx
import { Form, FormField, FormSubmit, useForm } from '@glyphui/ui/form'

const form = useForm({ schema, defaultValues })   // zod, valibot, arktype: any Standard Schema

<Form form={form} onSubmit={async (values) => {
  const res = await api.signup(values)
  if (res.taken) return { errors: { email: 'Already registered' } }   // shown on the field
}}>
  <FormField control={form.control} name="email" label="Email">     {/* name is type-checked */}
    {(field) => <Input {...field} />}
  </FormField>
  <FormSubmit>Sign up</FormSubmit>                                     {/* spinner while submitting */}
</Form>
```

| Import | What you get |
|---|---|
| `@glyphui/ui` | ~30 components on Radix, `AppShell` / `Sidebar` / `Navbar` / `PageHeader`, `Async` + `EmptyState` / `ErrorState`, `GlyphProvider`, `useColorMode`, presets |
| `@glyphui/ui/form` | `useForm`, `Form`, `FormField`, `FormSubmit`, `FormError` |
| `@glyphui/ui/data-table` | `DataTable` with sorting, search, selection, paging and loading / empty / error states |
| `@glyphui/tokens` | The framework-free theme engine, if you only need the CSS variables |

## Develop

```sh
pnpm install
pnpm dev          # showcase at http://localhost:5173, running on library source (instant HMR)
pnpm check        # lint, typecheck (incl. type tests), tests, build
pnpm changeset    # describe a change to a published package
```

Showcase deep links: `?theme=brutalist&mode=light`.

```
packages/tokens   theme engine (no React)
packages/ui       components/, patterns/, provider/, hooks/, utils/, register.ts, themes.ts
apps/showcase     one app, four themes (deployed to GitHub Pages)
tooling/tsconfig  shared TypeScript configs
```

## License

[MIT](./LICENSE) © Mohak Gupta
