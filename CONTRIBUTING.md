# Contributing to Glyph

## Component conventions

Every component follows the same shape so any of them can be fixed without learning a new pattern.

1. **One folder per component**: `button/button.tsx`, `button.styles.ts`, `button.test.tsx`, `index.ts`.
2. **Styles live in `*.styles.ts`** and use Glyph's `tv()` (from `utils/tv`) with **slots**, even for single-element components (`slots: { base: '...' }`).
3. **Only semantic token classes**: `bg-primary`, `text-muted-foreground`, `rounded-md`, `shadow-md`, `text-h3`, `h-(--glyph-control-md)`. Never `bg-blue-500`. Themed border width: `border-(length:--glyph-border-width)` (`themedBorder` in `utils/styles`).
4. **Class names must be literals** somewhere in source so Tailwind's scanner finds them. Map props to classes with objects, never template strings.
5. **Start with `useComponentConfig('Name', props)`**. It applies the theme's `defaultVariants` and returns per-slot classes. Pass slot classes before the caller's `className`: `s.base({ class: [slots.base, className] })`.
6. **Register the component** in `src/register.ts` (one line) so `theme.components.Name` is typed.
7. **`data-slot="name"`** on the root element (and on meaningful parts) as a stable styling hook.
8. **Polymorphism through `asChild`** (Radix Slot), not an `as` prop.
9. **Form controls call `useFieldControl(props)`** so `Field` can wire id, `aria-describedby`, `aria-invalid`, `required` and `disabled`.
10. **Export** the component, its `Props` type and its styles from the folder's `index.ts`, then from `src/index.ts`.

## Documenting a component

Every component has a catalog entry in `apps/docs/src/content/<slug>/`:

- `meta.ts`: `defineDoc({ name, slug, category, status, description, exports, source, propsOf, examples, notes })`
- `examples/<file>.tsx`: one file per example, whose default export renders it. The docs show this file's source verbatim, so examples are type-checked and can't drift.

Prop tables are extracted from the TypeScript source at build time, and the Theming section reads slots and variants from the component's `*Styles`. Write JSDoc on props; it becomes the description.

`pnpm --filter docs test` fails if any runtime export of `@glyphui/ui`, `/form` or `/data-table` is missing from a `meta.ts`, if a listed export no longer exists, or if examples and files disagree. Planned components live in `apps/docs/src/content/roadmap.ts`; move an entry into its own folder when it ships.

Status: `stable` (API settled), `beta` (usable, may change), `planned` (roadmap).

## Type contracts

`*.test-d.ts(x)` files are checked by `pnpm typecheck` and never run. Use `// @ts-expect-error` to lock in what must *not* compile.

## Testing

| Command | What it checks |
| --- | --- |
| `pnpm test` | Unit and interaction tests (Vitest + Testing Library, jsdom) |
| `pnpm test:coverage` | The same, with a coverage floor per package (`vitest.config.ts` → `thresholds`). Raise the floor when you add tests; never lower it. |
| `pnpm e2e` | Playwright against the built docs (`pnpm -C apps/docs build` first): axe on every page in light and dark, interaction tests for the hard components, and, on Linux only, visual regression |
| `pnpm -C apps/docs e2e:docker` | The full e2e suite, visual included, in the Playwright Linux image (needs Docker) |
| `pnpm -C apps/docs e2e:update` | Regenerate the visual baselines in Docker. Without Docker, run the **Update visual baselines** workflow on your branch from the Actions tab. |
| `pnpm test:consumer` | Packs the packages, installs the tarballs into a fresh Vite app with the newest supported dependency versions, then type-checks (`skipLibCheck: false`) and builds |
| `pnpm size` | Gzipped size of every public entry against `scripts/size-budget.json` (5% tolerance). After an intended change, `pnpm size --update` and commit the budget. |

Notes:

- **Every docs example is an e2e fixture.** Adding an example adds an axe check and three screenshots (glyph light, glyph dark, brutalist light). Examples must render the same every time: no `Math.random`, no remote images, and dates relative to `new Date()` (the visual tests freeze time).
- **Visual baselines are Linux-only** (`apps/docs/e2e/__screenshots__/**/*-linux.png`); fonts render differently on macOS, so local runs skip the visual project. Commit only the Linux files.
- **Accessibility debt is explicit.** `apps/docs/e2e/a11y-known-issues.ts` lists the violations we know about, each with a reason. Remove an entry when you fix it; anything not listed fails the suite.
- **Known bugs can be pinned with `test.fail`** and a reason, so the test flips red once the bug is fixed and the marker must be removed.

## Dependencies

`pnpm-workspace.yaml` sets `minimumReleaseAge` to 14 days: new versions are not installed until they have been public for two weeks.

## Custom domain (maintainers)

The docs deploy to `https://khalmohak.github.io/glyph/` by default. Everything that depends on the address (the base path, canonical and Open Graph URLs, `sitemap.xml`, `robots.txt`, `llms.txt`, and links to the demo apps) comes from two build settings, `DOCS_BASE` and `SITE_URL`. The Pages workflow sets both from one repository variable.

To move to a domain such as `glyphui.dev`:

1. At your DNS provider, point the apex domain at GitHub Pages:
   - `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - optionally a `CNAME` for `www` → `khalmohak.github.io`
2. In the repository's **Settings → Secrets and variables → Actions → Variables**, add `CUSTOM_DOMAIN` = `glyphui.dev`.
3. Run the **Docs and demos** workflow (or push to `main`). It builds everything for `/`, writes the `CNAME` file and deploys.
4. In **Settings → Pages**, check that the custom domain shows `glyphui.dev`, then turn on **Enforce HTTPS** once the certificate is issued.
5. Update the absolute links in the READMEs (they're shown on npm, so they can't follow the variable).

Removing the variable moves the site back to GitHub Pages under `/glyph/`.

## Releasing (maintainers)

`pnpm changeset` → describe the change → merge. `pnpm release` builds and publishes.

## Workflow

1. Fork and clone, then `pnpm install` (Node 24, pnpm via Corepack). A pre-commit hook runs Biome on staged files.
2. `pnpm dev` and work against the docs (http://localhost:5174). Check your change in all four themes, light and dark.
3. `pnpm check` before pushing.
4. If a published package changed, run `pnpm changeset` and commit the generated file.
5. Open a pull request. CI runs lint, typecheck, tests with coverage, build, export checks and the size budget, plus the e2e suite and the consumer smoke test.

Maintainers merge the "Release packages" pull request that Changesets keeps open; merging it publishes to npm with provenance.
