# @glyphui/ui

React components on Tailwind CSS v4, built for AI coding agents. They take their whole look from **one typed theme file**, and the parts every app rebuilds come solved: forms, data tables, app layout, and loading / empty / error states. An MCP server and Markdown docs give your agent the real API instead of a guess.

[Docs](https://glyphui.xyz/) · [Components](https://glyphui.xyz/components) · [Theme studio](https://glyphui.xyz/themes) · [GitHub](https://github.com/khalmohak/glyph) · [Changelog](https://github.com/khalmohak/glyph/blob/main/packages/ui/CHANGELOG.md)

## Install

```sh
npm install @glyphui/ui
# optional: forms and data tables (TanStack Table version 8)
npm install react-hook-form @hookform/resolvers zod @tanstack/react-table@8
# optional: charts from @glyphui/ui/chart
npm install recharts
```

Requires React 19 and Tailwind CSS 4.1 or later.

Using a coding agent? Add the MCP server so it looks up Glyph's props and examples instead of guessing: `claude mcp add glyph -- npx -y @glyphui/mcp`. Other editors: [Use with AI agents](https://glyphui.xyz/docs/ai).

## Set up

```css
/* index.css */
@import "@glyphui/ui/fonts.css";      /* Geist, used by the default theme */
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/blocks/styles.css"; /* only with @glyphui/blocks */
```

```tsx
// main.tsx
import { GlyphProvider, presets } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <GlyphProvider theme={presets.glyph} defaultMode="system" router={reactRouter} toaster>
      <App />
    </GlyphProvider>
  </BrowserRouter>,
)
```

- `router` (optional) makes Glyph's links client-side and marks the current Sidebar, Navbar and NavigationMenu item automatically. For other routers, pass `{ Link, useIsActive }`; the [getting-started guide](https://glyphui.xyz/getting-started) has TanStack Router and Next.js versions.
- `toaster` mounts the toast container, so `toast.success('Saved')` works anywhere. `useConfirm()` needs no setup.

To avoid a light flash for dark-mode visitors, add the Vite plugin:

```ts
// vite.config.ts
import { glyphColorMode } from '@glyphui/ui/vite'

export default defineConfig({ plugins: [react(), tailwindcss(), glyphColorMode()] })
```

With an SSR framework, render `<ColorModeScript />` in the document head instead.

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
- colors, separately for light and dark, including a five-color chart palette
- a nine-step type scale (size, line height, tracking, weight)
- radius, shadows, border width, motion and control height
- defaults and extra classes for each component

Everything is type-checked. A Button size or Card part that doesn't exist is a compile error.

The same tokens work in your own markup: `bg-primary`, `text-muted-foreground`, `rounded-lg`, `shadow-md`, `text-h2`, `font-display`.

## Components

| Category | Components (132) |
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
| Auth | Auth provider · AuthLayout · Clerk bridge · Code forms · Firebase adapter · Memory adapter · Password reset · Protected routes · REST adapter · Session dialogs · SignInForm · SignUpForm · SocialButtons · UserMenu |
| Blocks (`@glyphui/blocks`) | AuthCard · Cta · Faq · FeatureGrid · FeatureSplit · Hero · LogoCloud · Newsletter · Pricing · SectionHeader · SiteFooter · Stats · Testimonials |
| Viewers (`@glyphui/viewers`) | AudioPlayer · CodeViewer · CsvViewer · DiffViewer · FilePreview · ImageViewer · JsonViewer · MarkdownViewer · PdfViewer · SpreadsheetViewer · VideoPlayer |

Every component has a page with live examples and props in the [docs](https://glyphui.xyz/components). Accessible behavior comes from [Radix UI](https://www.radix-ui.com/). Every component accepts `className`, and most accept `asChild`.

## Patterns

### Layout

```tsx
import { AppShell, Sidebar, SidebarContent, SidebarItem, PageHeader } from '@glyphui/ui'

<AppShell sidebar={<Sidebar><SidebarContent>
  <SidebarItem href="/inbox" icon={<Inbox />} badge={3}>Inbox</SidebarItem>
</SidebarContent></Sidebar>}>
  <PageHeader title="Inbox" actions={<Button>New</Button>} />
</AppShell>
```

The sidebar collapses to an icon strip on desktop and opens as a focus-trapped drawer on mobile. `Navbar` builds a responsive site header from `links` data. With `router` on `GlyphProvider`, the item for the current URL is marked active; pass `active` to override.

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

### Modals and confirmations

```tsx
<Modal title="New invoice" trigger={<Button>New invoice</Button>}
  footer={<FormSubmit form={form}>Create</FormSubmit>}>   {/* outside <Form>, so pass form */}
  <Form form={form} onSubmit={save}>…</Form>
</Modal>

const confirm = useConfirm()
if (await confirm({ title: 'Delete invoice?', tone: 'danger' })) remove()
```

For a plain form, pass `onSubmit` to `Modal` and a `type="submit"` button in the footer.

### Data tables: `@glyphui/ui/data-table`

```tsx
import { createColumnHelper, DataTable, useTableUrlState } from '@glyphui/ui/data-table'

const col = createColumnHelper<Invoice>()
const columns = [
  col.accessor('number', { header: 'Invoice' }),
  col.accessor('status', { header: 'Status', meta: { filter: { type: 'multi', options } } }),
  col.accessor('total', { header: 'Total', meta: { align: 'right', filter: { type: 'range' } } }),
]

// Client mode: pass every row; the table searches, filters, sorts and pages them.
<DataTable data={invoices} columns={columns} search selectable exportCsv
  bulkActions={(selection) => <Button onClick={() => archive(selection.ids)}>Archive</Button>} />

// Server mode: the table hands you its state; you pass back one page and the total.
const url = useTableUrlState() // page, sort, search and filters in the URL
<DataTable mode="server" data={page?.rows} rowCount={page?.total} loading={isFetching}
  columns={columns} {...url} />
```

Filter chips (select, multi with counts, range, date range, text), multi-column sorting, page numbers and page size, select-all across pages with a floating bulk bar, column hiding, resizing, pinning and reordering, density, clickable or linked rows, expandable rows, inline editing with `editableCell()`, CSV export, cards on phones, and loading, empty, no-results and error states. For 10,000+ rows, pass a `virtualRows()` virtualizer from `@glyphui/ui/data-table/virtual` to `virtualize`.

### Charts: `@glyphui/ui/chart`

```tsx
<ChartCard title="Revenue" period={{ options: periods, value, onValueChange }}>
  <AreaChart title="Revenue" data={revenue} index="month" stacked
    series={[{ key: 'recurring', label: 'Recurring' }, { key: 'oneOff', label: 'One-off' }]}
    referenceLines={[{ y: 40000, label: 'Target' }]} />
</ChartCard>
```

Line, area, bar, composed, pie and donut, radar, radial bar, scatter and bubble, funnel, treemap, Sankey, calendar heatmap, gauge and sparkline charts. Series use the theme's `chart-1` to `chart-5` colors and animate at the theme's motion level. Legends toggle series, `brush` zooms, and every chart takes `loading`, `error` and an empty state. `ChartCard` adds a period selector, a "view as table" toggle and PNG/SVG download; `exportChart()` exports any chart with its theme colors baked in. Every chart includes a data table for screen readers. Needs `recharts`.

### Async states

```tsx
<Async result={useQuery({ queryKey: ['projects'], queryFn })}>
  {(projects) => <ProjectList projects={projects} />}
</Async>
```

## License

MIT
