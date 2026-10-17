import { test as base, expect, type Page } from '@playwright/test'

export type Mode = 'light' | 'dark'
export type Preset = 'glyph' | 'brutalist' | 'editorial' | 'playful'

/** Sets the docs color mode and theme before any page script runs. */
export async function prepare(
  page: Page,
  {
    mode = 'dark',
    theme = 'glyph',
    motion = false,
  }: { mode?: Mode; theme?: Preset; motion?: boolean } = {},
) {
  await page.addInitScript(
    ([m, t]) => {
      localStorage.setItem('glyph-mode', m)
      localStorage.setItem('glyph-docs-theme', t)
    },
    [mode, theme] as const,
  )
  // Colors change when the theme stylesheet mounts after first paint; with transitions on,
  // axe and screenshots can sample an in-between color, so static checks turn motion off.
  // Interaction tests keep it (`motion: true`): enter/exit animations drive open/close state.
  if (motion) return
  await page.addInitScript(() => {
    const style = document.createElement('style')
    style.dataset.e2e = 'no-motion'
    style.textContent =
      '*,*::before,*::after{transition-duration:0s!important;transition-delay:0s!important;animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;caret-color:transparent!important}'
    document.addEventListener('DOMContentLoaded', () => document.head.append(style))
  })
}

/** Navigates and waits until the page, fonts and lazy examples have settled. */
export async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForSelector('style[data-glyph-theme-style]', { state: 'attached' })
  // Lazy example previews show a spinner while their chunk loads.
  await expect(page.locator('[data-example] > [data-slot="spinner"]')).toHaveCount(0)
  await settle(page)
}

/**
 * Waits for finite CSS transitions and animations to end. The theme stylesheet is injected
 * after first paint, so `transition-colors` elements briefly animate between colors, which
 * would make contrast checks and screenshots flaky. Infinite animations (spinners) are ignored.
 */
export async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let i = 0; i < 3; i++) {
      const running = document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Number.POSITIVE_INFINITY)
      if (running.length === 0) return
      await Promise.race([
        Promise.all(running.map((a) => a.finished.catch(() => undefined))),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ])
    }
  })
}

/** Opens a component page and returns the preview container of one example. */
export async function example(page: Page, id: string) {
  const [slug] = id.split('/')
  await open(page, `/components/${slug}/`)
  const preview = page.locator(`[data-example="${id}"]`)
  await preview.scrollIntoViewIfNeeded()
  return preview
}

export const test = base
export { expect }
