import { docs } from './catalog'
import { expect, type Mode, open, type Preset, prepare, test } from './fixtures'

/**
 * Visual regression: every docs example, screenshotted per theme and mode. Baselines are
 * Linux-only (rendered in the Playwright Docker image); refresh with `pnpm e2e:update`.
 */
const combos: { name: string; theme: Preset; mode: Mode }[] = [
  { name: 'glyph-light', theme: 'glyph', mode: 'light' },
  { name: 'glyph-dark', theme: 'glyph', mode: 'dark' },
  { name: 'brutalist-light', theme: 'brutalist', mode: 'light' },
]

/** Examples render "today" (calendars, date pickers), so time is frozen. */
const NOW = new Date('2026-10-15T10:00:00Z')

/** 1×1 gray PNG used in place of remote images so screenshots never depend on the network. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  'base64',
)

for (const combo of combos) {
  for (const doc of docs) {
    if (!doc.examples?.length) continue
    test(`${doc.slug} (${combo.name})`, async ({ page }) => {
      await page.clock.setFixedTime(NOW)
      await page.route(/^https?:\/\/(?!localhost)/, (route) =>
        route.request().resourceType() === 'image'
          ? route.fulfill({ body: PIXEL, contentType: 'image/png' })
          : route.abort(),
      )
      await prepare(page, { mode: combo.mode, theme: combo.theme })
      await open(page, `/components/${doc.slug}/`)
      // Recharts animates in JS, which the no-motion stylesheet can't stop.
      if (await page.locator('[data-example] .recharts-surface').count()) {
        await page.waitForTimeout(1600)
      }

      for (const example of doc.examples ?? []) {
        const preview = page.locator(`[data-example="${doc.slug}/${example.file}"]`)
        await preview.scrollIntoViewIfNeeded()
        await expect(preview).toHaveScreenshot([combo.name, `${doc.slug}--${example.file}.png`])
      }
    })
  }
}
