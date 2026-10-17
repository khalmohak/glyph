import AxeBuilder from '@axe-core/playwright'
import { isKnown } from './a11y-known-issues'
import { routes } from './catalog'
import { example, expect, type Mode, open, prepare, test } from './fixtures'

const modes: Mode[] = ['light', 'dark']

/**
 * Nodes we don't control. Each entry needs a reason.
 * - `.shiki`: code-sample token colors come from the docs' syntax theme, not from Glyph.
 */
const EXCLUDE = ['.shiki']

for (const mode of modes) {
  for (const route of routes) {
    test(`${route} has no axe violations (${mode})`, async ({ page }) => {
      await prepare(page, { mode })
      await open(page, route)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude(EXCLUDE)
        .analyze()

      const all = results.violations.map((v) => ({
        rule: v.id,
        help: v.help,
        nodes: v.nodes.map((n) => ({ target: n.target.join(' '), html: n.html })),
      }))
      // Machine-readable record of every violation, used to audit the known-issues list.
      test
        .info()
        .annotations.push({ type: 'axe', description: JSON.stringify({ route, mode, all }) })
      const unexpected = all
        .map((v) => ({
          ...v,
          nodes: v.nodes
            .filter((n) => !isKnown(route, mode, v.rule, `${n.target} ${n.html}`))
            .map((n) => n.target),
        }))
        .filter((v) => v.nodes.length > 0)
      expect(unexpected, `Accessibility violations on ${route} (${mode})`).toEqual([])
    })
  }
}

/**
 * Overlays only exist while open, so the route sweep above never audits them. Open each one
 * and audit the whole page: a modal overlay hides the rest of the page from assistive tech,
 * so anything still focusable behind it is a violation.
 */
type Preview = import('@playwright/test').Locator
const overlays: {
  id: string
  open: (preview: Preview) => Promise<void>
  /** Rules a third-party primitive breaks that we can't turn off, each with a reason. */
  known?: string[]
}[] = [
  {
    id: 'user-menu/sidebar',
    open: async (preview) => {
      await preview.getByRole('button', { name: 'Sign in as Ada' }).click()
      await preview.getByRole('button', { name: /Ada Lovelace/ }).click()
    },
  },
  {
    id: 'dropdown-menu/actions',
    open: (preview) => preview.getByRole('button', { name: 'Project actions' }).click(),
  },
  { id: 'dialog/basic', open: (preview) => preview.getByRole('button').first().click() },
  {
    id: 'select/basic',
    open: (preview) => preview.getByRole('combobox').click(),
    // Radix Select always hides the rest of the page while open and has no non-modal option.
    // Focus stays inside the listbox until it closes, so nothing behind it is reachable.
    known: ['aria-hidden-focus'],
  },
  { id: 'popover/share', open: (preview) => preview.getByRole('button').first().click() },
  { id: 'combobox/basic', open: (preview) => preview.getByRole('combobox').first().click() },
  {
    id: 'date-picker/basic',
    open: (preview) =>
      preview
        .getByRole('button', { name: /Launch date|Pick a date/ })
        .first()
        .click(),
  },
  {
    id: 'context-menu/file',
    open: (preview) =>
      preview
        .locator('[data-slot="context-menu-trigger"], [data-state]')
        .first()
        .click({ button: 'right' }),
  },
  {
    id: 'sheet/filters',
    open: (preview) => preview.getByRole('button', { name: 'Filters' }).click(),
  },
]

for (const mode of modes) {
  for (const overlay of overlays) {
    test(`${overlay.id} open has no axe violations (${mode})`, async ({ page }) => {
      await prepare(page, { mode })
      const preview = await example(page, overlay.id)
      await overlay.open(preview)
      await expect(
        page.locator('[role="menu"], [role="dialog"], [role="listbox"]').first(),
      ).toBeVisible()
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude(EXCLUDE)
        .analyze()
      const violations = results.violations
        .filter((v) => !overlay.known?.includes(v.id))
        .map((v) => ({
          rule: v.id,
          nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
        }))
      expect(violations, `Accessibility violations with ${overlay.id} open (${mode})`).toEqual([])
    })
  }
}
