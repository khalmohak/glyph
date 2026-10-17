import AxeBuilder from '@axe-core/playwright'
import { isKnown } from './a11y-known-issues'
import { routes } from './catalog'
import { expect, type Mode, open, prepare, test } from './fixtures'

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
