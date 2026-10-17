import AxeBuilder from '@axe-core/playwright'
import { expect, type Mode, open, prepare, test } from './fixtures'

/**
 * The route sweep audits each component page's default (Examples) tab. The other tabs only
 * render when selected, so audit them here for a few representative components.
 */
const pages = ['button', 'select', 'data-table', 'slider', 'tabs']
const tabs = {
  playground: 'Playground',
  api: 'API',
  theming: 'Theming',
  accessibility: 'Accessibility',
} as const
const modes: Mode[] = ['light', 'dark']

for (const mode of modes) {
  for (const slug of pages) {
    test(`${slug} tabs have no axe violations (${mode})`, async ({ page }) => {
      test.setTimeout(180_000)
      await prepare(page, { mode })
      for (const [tab, label] of Object.entries(tabs)) {
        await open(page, `/components/${slug}/?tab=${tab}`)
        // A page without a playground falls back to Examples; skip it then.
        if (tab === 'playground' && (await page.getByTestId('playground').count()) === 0) continue
        // Examples render their own tabs, so wait for the page's tab by name.
        await expect(page.getByRole('tab', { name: label, exact: true }).first()).toHaveAttribute(
          'aria-selected',
          'true',
        )
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .exclude(['.shiki'])
          .analyze()
        const violations = results.violations.map((v) => ({
          rule: v.id,
          nodes: v.nodes.map((n) => n.target.join(' ')),
        }))
        expect(violations, `${slug} ?tab=${tab} (${mode})`).toEqual([])
      }
    })
  }
}
