<div align="center">

# Glyph

**The React UI library built for AI coding agents.**

React components on Tailwind CSS v4 that your agent looks up instead of guessing: an MCP server, llms.txt and Markdown docs give Claude Code, Cursor and Codex the real API for the version you installed. One typed theme file sets the whole look, and the parts every app rebuilds (forms, data tables, app layout, loading / empty / error states) come solved.

[![CI](https://github.com/khalmohak/glyph/actions/workflows/ci.yml/badge.svg)](https://github.com/khalmohak/glyph/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@glyphui/ui?label=%40glyphui%2Fui)](https://www.npmjs.com/package/@glyphui/ui)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

[Docs](https://glyphui.xyz/) · [Components](https://glyphui.xyz/components) · [Use with AI agents](https://glyphui.xyz/docs/ai) · [Theme studio](https://glyphui.xyz/themes) · [Contributing](./CONTRIBUTING.md) · [Changelog](./packages/ui/CHANGELOG.md)

</div>

## For coding agents

```sh
claude mcp add glyph -- npx -y @glyphui/mcp
```

[`@glyphui/mcp`](./packages/mcp) gives Claude Code, Cursor, VS Code, Codex, Windsurf and Claude Desktop Glyph's components, props, examples, setup and theming as tools. It is bundled for one Glyph version and makes no network requests. Agents that read the web get [llms.txt](https://glyphui.xyz/llms.txt), [llms-full.txt](https://glyphui.xyz/llms-full.txt), and every docs page as Markdown (add `.md` to the URL, or send `Accept: text/markdown`). Setup for each editor and an `AGENTS.md` block: [Use with AI agents](https://glyphui.xyz/docs/ai).

## Install

```sh
pnpm add @glyphui/ui
pnpm add @glyphui/blocks                                                   # optional: page sections
pnpm add @glyphui/auth                                                     # optional: auth and protected routes
pnpm add react-hook-form @hookform/resolvers zod @tanstack/react-table@8   # optional: forms and data tables
pnpm add recharts                                                          # optional: charts
pnpm add @glyphui/viewers                                                  # optional: PDF, CSV, JSON, code, media viewers
```

All `@glyphui/*` packages are released together with one version number; keep them on the same version. `blocks`, `auth` and `viewers` use your app's copy of `@glyphui/ui` (a peer dependency), so there is only ever one Glyph context in the app.

```css
/* index.css */
@import "@glyphui/ui/fonts.css";      /* Geist, used by the default theme */
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/blocks/styles.css"; /* only with @glyphui/blocks */
@import "@glyphui/auth/styles.css";   /* only with @glyphui/auth screens */
@import "@glyphui/viewers/styles.css"; /* only with @glyphui/viewers */
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

```tsx
import { AuthProvider, createAuthClient } from '@glyphui/auth'
import { restAdapter } from '@glyphui/auth/rest'
import { RequireAuth, useRedirectAfterSignIn } from '@glyphui/auth/react-router'
import { SignInForm } from '@glyphui/auth/ui'

const auth = createAuthClient(restAdapter({ baseUrl: '/api' }))   // or firebase, clerk

function SignInPage() {
  const continueToApp = useRedirectAfterSignIn('/app')               // back to ?next=, same-origin only
  return <SignInForm signUpHref="/sign-up" onSuccess={continueToApp} /> // codes, 2FA, OAuth included
}

<AuthProvider client={auth}>
  <Route path="/sign-in" element={<SignInPage />} />
  <Route path="/app" element={<RequireAuth />}>{/* signed-out users go to /sign-in?next=… */}</Route>
</AuthProvider>
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
| `@glyphui/auth` | `AuthProvider`, `useAuth`, roles and permissions, session refresh, tab sync and idle timeout; adapters for your REST API, Firebase and Clerk (`/rest`, `/firebase`, `/clerk`, `/memory`); React Router guards and loaders (`/react-router`); sign-in, sign-up, reset, code, user-menu and session screens (`/ui`) |
| `@glyphui/tokens` | The framework-free theme engine, if you only need the CSS variables |
| `@glyphui/mcp` | MCP server that gives coding agents Glyph's components, props, examples, setup and theming |

## Use with AI

Claude Code, Cursor, VS Code, Windsurf and Claude Desktop can look up Glyph's real API through the MCP server instead of guessing props:

```sh
claude mcp add glyph -- npx -y @glyphui/mcp
```

Setup for each editor, [llms.txt](https://glyphui.xyz/llms.txt), Markdown versions of every page and an `AGENTS.md` snippet are in the [Use with AI](https://glyphui.xyz/docs/ai) guide.

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

Every component has a page with live examples, props and theming slots in the [docs](https://glyphui.xyz/components). Regenerate this table with `pnpm -C apps/docs readme:components`.

## Develop

```sh
pnpm install
pnpm dev          # docs at :5174, running on library source (instant HMR)
pnpm check        # lint, typecheck (incl. type tests), tests, build
pnpm changeset    # describe a change to a published package
```

```
packages/tokens   theme engine (no React)
packages/blocks   page sections built from @glyphui/ui
packages/viewers  file and data viewers (PDF, CSV, spreadsheets, JSON, code, Markdown, diffs, media)
packages/ui       components/, patterns/, provider/, hooks/, utils/, register.ts, themes.ts
packages/auth     auth client, REST/Firebase/Clerk adapters, React Router guards, auth screens
packages/mcp      MCP server for coding agents; its data is generated from apps/docs at build
apps/docs         docs and showcase: gallery, playgrounds, theme studio, guides (GitHub Pages /glyph/)
apps/demo-saas    Ledgerline demo app with Playwright journeys (/glyph/demo/)
apps/auth-example full auth flow against a fake REST server (/glyph/auth/)
tooling/tsconfig  shared TypeScript configs
```

## License

[MIT](./LICENSE) © Mohak Gupta
