<div align="center">

# Glyph

**One theme file. Every screen follows.**

React components on Tailwind CSS v4 that take their whole look from one typed theme, with the parts every app rebuilds (forms, data tables, app layout, loading / empty / error states) already solved.

[![CI](https://github.com/khalmohak/glyph/actions/workflows/ci.yml/badge.svg)](https://github.com/khalmohak/glyph/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@glyphui/ui?label=%40glyphui%2Fui)](https://www.npmjs.com/package/@glyphui/ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[Docs](https://khalmohak.github.io/glyph/) · [Components](https://khalmohak.github.io/glyph/components) · [Showcase](https://khalmohak.github.io/glyph/showcase/) · [Contributing](./CONTRIBUTING.md) · [Changelog](./packages/ui/CHANGELOG.md)

</div>

## Install

```sh
pnpm add @glyphui/ui
pnpm add @glyphui/blocks                                                   # optional: page sections
pnpm add react-hook-form @hookform/resolvers zod @tanstack/react-table@8   # optional: forms and data tables
pnpm add recharts                                                          # optional: charts
```

```css
/* index.css */
@import "@glyphui/ui/fonts.css";      /* Geist, used by the default theme */
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/blocks/styles.css"; /* only with @glyphui/blocks */
```

```ts
// vite.config.ts: sets dark mode before first paint, so there is no light flash
import { glyphColorMode } from '@glyphui/ui/vite'

export default defineConfig({ plugins: [react(), tailwindcss(), glyphColorMode()] })
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
import { reactRouter } from '@glyphui/ui/react-router'
import theme from './glyph.theme'

createRoot(root).render(
  <BrowserRouter>
    {/* router: client-side links and automatic active nav items. toaster: toast() works anywhere. */}
    <GlyphProvider theme={theme} router={reactRouter} toaster>
      <App />
    </GlyphProvider>
  </BrowserRouter>,
)
```

A theme sets color (per light and dark mode, including a five-color chart palette), typography (a nine-step scale with size, line height, tracking and weight), radius, shadows, border width, motion and control density, plus per-component defaults and classes. Every option is type-checked.

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

`<FormSubmit form={form}>` also works outside the form, for example in a `Modal` footer. Confirmations are one line: `if (await confirm({ title: 'Delete project?', tone: 'danger' })) ...` with `useConfirm()`.

| Import | What you get |
|---|---|
| `@glyphui/ui` | Components on Radix (Modal, DatePicker, Combobox, FileUpload, CommandMenu, Toast...), `AppShell` / `Sidebar` / `Navbar` / `PageHeader`, `Async` + `EmptyState` / `ErrorState`, `useConfirm`, `GlyphProvider`, `useColorMode`, presets |
| `@glyphui/ui/form` | `useForm`, `Form`, `FormField`, `FormSubmit`, `FormError` |
| `@glyphui/ui/data-table` | `DataTable`: client or server mode, filter chips, multi-sort, pagination, selection with bulk actions, column controls, URL state, inline editing, CSV export (needs `@tanstack/react-table@8`); virtualization in `@glyphui/ui/data-table/virtual` |
| `@glyphui/ui/chart` | 15 chart types (line, area, bar, composed, pie, radar, scatter, funnel, treemap, Sankey, heatmap, gauge, sparkline, ...), `ChartCard` and PNG/SVG export, colored by the theme's chart palette (needs `recharts`) |
| `@glyphui/ui/react-router` | `reactRouter` for `GlyphProvider`: client-side links and automatic active items |
| `@glyphui/ui/vite` | `glyphColorMode()` Vite plugin that prevents the dark-mode flash |
| `@glyphui/ui/fonts.css` | Geist and Geist Mono for the default theme |
| `@glyphui/blocks` | Page sections: Hero, Pricing, FAQ, Testimonials, Newsletter, AuthCard, SiteFooter and more |
| `@glyphui/tokens` | The framework-free theme engine, if you only need the CSS variables |

## Components

| Category | Components (107) |
|---|---|
| Actions | Button · CopyButton · Toggle |
| Forms | Calendar · Checkbox · Combobox · DatePicker · Field · FileUpload · Input · InputOTP · Label · NumberInput · PasswordInput · RadioGroup · SegmentedControl · Select · Slider · Switch · TagInput · Textarea |
| Overlays | Alert Dialog · ContextMenu · Dialog · Dropdown Menu · HoverCard · Modal · Popover · Sheet · Tooltip |
| Navigation | Breadcrumb · CommandMenu · Link · NavigationMenu · Pagination · Stepper · Tabs |
| Feedback | Alert · Banner · Progress · Skeleton · Spinner · Toast |
| Data display | Accordion · Avatar · Badge · Carousel · Chart · ChartCard · Collapsible · DescriptionList · FunnelChart · Gauge · Heatmap · Kbd · PieChart · RadarChart · SankeyChart · ScatterChart · Sparkline · StatCard · Table · Timeline · Treemap · TreeView |
| Typography | Blockquote · Code · Eyebrow · Heading · Prose · Text |
| Layout | AspectRatio · Card · Container · Grid · Resizable · ScrollArea · Section · Separator · Stack · VisuallyHidden |
| Patterns | AppShell · Async · DataTable · Form · Motion · Navbar · PageHeader · Router integration · Sidebar · Theming · Utilities · Virtual rows · Vite plugin |
| Blocks (`@glyphui/blocks`) | AuthCard · Cta · Faq · FeatureGrid · FeatureSplit · Hero · LogoCloud · Newsletter · Pricing · SectionHeader · SiteFooter · Stats · Testimonials |

Every component has a page with live examples, props and theming slots in the [docs](https://khalmohak.github.io/glyph/components). Regenerate this table with `pnpm -C apps/docs readme:components`.

## Develop

```sh
pnpm install
pnpm dev          # showcase at :5173 and docs at :5174, running on library source (instant HMR)
pnpm check        # lint, typecheck (incl. type tests), tests, build
pnpm changeset    # describe a change to a published package
```

Showcase deep links: `?theme=brutalist&mode=light`.

```
packages/tokens   theme engine (no React)
packages/blocks   page sections built from @glyphui/ui
packages/ui       components/, patterns/, provider/, hooks/, utils/, register.ts, themes.ts
apps/docs         component catalog, examples, prop tables, roadmap (GitHub Pages /glyph/)
apps/showcase     one app, four themes (GitHub Pages /glyph/showcase/)
tooling/tsconfig  shared TypeScript configs
```

## License

[MIT](./LICENSE) © Mohak Gupta
