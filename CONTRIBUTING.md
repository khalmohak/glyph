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

## Type contracts

`*.test-d.ts(x)` files are checked by `pnpm typecheck` and never run. Use `// @ts-expect-error` to lock in what must *not* compile.

## Dependencies

`pnpm-workspace.yaml` sets `minimumReleaseAge` to 14 days: new versions are not installed until they have been public for two weeks.

## Releasing (maintainers)

`pnpm changeset` → describe the change → merge. `pnpm release` builds and publishes.

## Workflow

1. Fork and clone, then `pnpm install` (Node 24, pnpm via Corepack). A pre-commit hook runs Biome on staged files.
2. `pnpm dev` and work against the showcase. Check your change in all four themes, light and dark.
3. `pnpm check` before pushing.
4. If a published package changed, run `pnpm changeset` and commit the generated file.
5. Open a pull request. CI runs lint, typecheck, tests and build.

Maintainers merge the "Release packages" pull request that Changesets keeps open; merging it publishes to npm with provenance.
