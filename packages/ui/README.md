# @glyphui/ui

React components on Tailwind CSS v4 that take their whole look from **one typed theme file**, with the parts every app rebuilds already solved: forms, data tables, app layout, and loading / empty / error states.

[Live showcase](https://khalmohak.github.io/glyph/) · [GitHub](https://github.com/khalmohak/glyph) · [Changelog](https://github.com/khalmohak/glyph/blob/main/packages/ui/CHANGELOG.md)

## Install

```sh
npm install @glyphui/ui
# optional: the form and data-table patterns
npm install react-hook-form @hookform/resolvers zod @tanstack/react-table
```

Requires React 19 and Tailwind CSS 4.1 or later.

## Set up

```css
/* index.css */
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
```

```tsx
// main.tsx
import { GlyphProvider, presets } from '@glyphui/ui'

createRoot(document.getElementById('root')!).render(
  <GlyphProvider theme={presets.glyph} defaultMode="system">
    <App />
  </GlyphProvider>,
)
```

To avoid a light flash for dark-mode visitors, run `getColorModeScript()` in `<head>`, or render `<ColorModeScript />` with an SSR framework.

## Your theme, in one file

```ts
// glyph.theme.ts
import { defineTheme, presets } from '@glyphui/ui'

export default defineTheme({
  name: 'acme',
  extends: presets.glyph, // glyph · brutalist · editorial · playful
  colors: {
    light: { primary: 'oklch(55% 0.2 30)' },
    dark: { primary: 'oklch(70% 0.19 45)' },
  },
  radius: { md: '6px', lg: '10px' },
  font: { sans: '"Inter Variable", system-ui, sans-serif' },
  components: {
    Button: { defaultVariants: { size: 'lg' }, className: { base: 'tracking-tight' } },
  },
})
```

A theme controls:
- colors, separately for light and dark
- a nine-step type scale (size, line height, tracking, weight)
- radius, shadows, border width, motion and control height
- defaults and extra classes for each component

Everything is type-checked. A Button size or Card part that doesn't exist is a compile error.

The same tokens work in your own markup: `bg-primary`, `text-muted-foreground`, `rounded-lg`, `shadow-md`, `text-h2`, `font-display`.

## Components

`Button` · `IconButton` · `Badge` · `Card` · `Heading` · `Text` · `Eyebrow` · `Kbd` · `Avatar` · `Separator` · `Skeleton` · `Spinner` · `Label` · `Field` · `Input` · `Textarea` · `Checkbox` · `Switch` · `Select` · `SegmentedControl` · `Tabs` · `Tooltip` · `Table` · `Container` · `Section` · `Stack` · `ThemeScope`

Accessible behavior comes from [Radix UI](https://www.radix-ui.com/). Every component accepts `className`, and most accept `asChild`.

## Patterns

### Layout

```tsx
import { AppShell, Sidebar, SidebarContent, SidebarItem, PageHeader } from '@glyphui/ui'

<AppShell sidebar={<Sidebar><SidebarContent>
  <SidebarItem href="/inbox" icon={<Inbox />} badge={3} active>Inbox</SidebarItem>
</SidebarContent></Sidebar>}>
  <PageHeader title="Inbox" actions={<Button>New</Button>} />
</AppShell>
```

The sidebar collapses to an icon strip on desktop and opens as a focus-trapped drawer on mobile. `Navbar` builds a responsive site header from `links` data. To use your router's link component, pass it to `GlyphProvider`: `linkComponent={RouterLink}`.

### Forms: `@glyphui/ui/form`

```tsx
import { Form, FormField, FormSubmit, useForm } from '@glyphui/ui/form'

const form = useForm({ schema, defaultValues: { email: '' } }) // zod, valibot, arktype...

<Form form={form} onSubmit={async (values) => {
  const res = await api.signup(values)
  if (res.taken) return { errors: { email: 'Already registered' } }
}}>
  <FormField control={form.control} name="email" label="Email">
    {(field) => <Input {...field} />}
  </FormField>
  <FormSubmit>Sign up</FormSubmit>
</Form>
```

Field names are checked against the schema. Server errors you return appear on their fields. If `onSubmit` throws, the error appears above the form in `<FormError />`.

### Data tables: `@glyphui/ui/data-table`

```tsx
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('number', { header: 'Invoice' }),
  col.accessor('total', { header: 'Total', meta: { align: 'right' } }),
]

<DataTable data={invoices} columns={columns} loading={isLoading} error={error}
  onRetry={refetch} search selectable pageSize={20} />
```

Includes sorting, search, row selection and pages, plus loading, empty, no-results and error states.

### Async states

```tsx
<Async result={useQuery({ queryKey: ['projects'], queryFn })}>
  {(projects) => <ProjectList projects={projects} />}
</Async>
```

## License

MIT
