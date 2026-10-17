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

## Hosting on Cloudflare (maintainers)

The site runs on Cloudflare Pages:

| Address | App | Pages project |
|---|---|---|
| `glyphui.xyz` | docs and showcase (`apps/docs`) | `glyph-docs` |
| `demo.glyphui.xyz` | Ledgerline demo (`apps/demo-saas`) | `glyph-demo` |
| `auth.glyphui.xyz` | auth example (`apps/auth-example`) | `glyph-auth` |

`.github/workflows/cloudflare.yml` builds all three, runs `scripts/cloudflare.mjs` (it creates the projects, attaches the domains and adds the DNS records, and does nothing if they exist), and deploys: production from `main`, a preview URL per pull request (listed in the job summary). It skips itself when the secrets below are missing (for example on forks). `www.glyphui.xyz` redirects to the root through a Cloudflare redirect rule.

The old address, `khalmohak.github.io/glyph`, is a small redirect site (`.github/pages-redirect/`, deployed by `pages.yml`) that sends every path to its new home, `/demo` and `/auth` to their subdomains.

One-time setup (already done for `glyphui.xyz`; here for a fresh account or domain):

1. Create a free Cloudflare account and **Add a site** → `glyphui.xyz` → Free plan.
2. At your registrar, replace the domain's nameservers with the two Cloudflare shows. Wait until the site says **Active** (minutes to a few hours).
3. **My Profile → API Tokens → Create token → Custom token** with:
   - Account › **Cloudflare Pages** › Edit
   - Zone › **DNS** › Edit, and Zone › **Zone** › Read, for `glyphui.xyz` only
4. In GitHub, **Settings → Secrets and variables → Actions**:
   - secret `CLOUDFLARE_API_TOKEN` = the token
   - secret `CLOUDFLARE_ACCOUNT_ID` = your account ID (shown on the domain's overview page)
   - (only if the domain differs) variable `CLOUDFLARE_DOMAIN`
5. Run the **Cloudflare** workflow (Actions tab → Run workflow), or push to `main`.
6. In Cloudflare, **Rules → Redirect Rules → Create rule → template "Redirect from WWW to Root"** so `www.glyphui.xyz` goes to `glyphui.xyz`.

Never paste the token into chat, an issue, or a file in the repo.


The address-dependent pieces (canonical and Open Graph URLs, `sitemap.xml`, `robots.txt`, `llms.txt`, links to the demos) come from `SITE_URL`, `DEMO_URL` and `AUTH_URL` (defaults: the `glyphui.xyz` hosts); base paths from `DOCS_BASE`, `DEMO_BASE` and `AUTH_EXAMPLE_BASE`. The package READMEs link to `glyphui.xyz` directly, since npm can't follow a build setting.

## Releasing (maintainers)

`pnpm changeset` → describe the change → merge. `pnpm release` builds and publishes.

## Workflow

1. Fork and clone, then `pnpm install` (Node 24, pnpm via Corepack). A pre-commit hook runs Biome on staged files.
2. `pnpm dev` and work against the docs (http://localhost:5174). Check your change in all four themes, light and dark.
3. `pnpm check` before pushing.
4. If a published package changed, run `pnpm changeset` and commit the generated file.
5. Open a pull request. CI runs lint, typecheck, tests with coverage, build, export checks and the size budget, plus the e2e suite and the consumer smoke test.

Maintainers merge the "Release packages" pull request that Changesets keeps open; merging it publishes to npm with provenance.
