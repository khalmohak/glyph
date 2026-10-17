import { expect, open, prepare, test } from './fixtures'

test.beforeEach(async ({ page }) => {
  await prepare(page, { mode: 'dark', motion: true })
})

test.describe('Component page', () => {
  test('shows the package, gzip size and new badge in the header', async ({ page }) => {
    await open(page, '/components/button/')
    await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible()
    await expect(page.getByTestId('gzip-size')).toHaveText(/^\d+(\.\d)? (kB|B) gzip$/)
    await open(page, '/components/pdf-viewer/')
    await expect(page.getByText(/^New in 0\.\d+$/)).toBeVisible()
  })

  test('keeps the selected tab in the URL across reloads', async ({ page }) => {
    await open(page, '/components/button/')
    await page.getByRole('tab', { name: 'API' }).click()
    const props = page.getByRole('table', { name: 'Button props', exact: true })
    await expect(props).toBeVisible()
    await expect(page).toHaveURL(/[?&]tab=api/)
    await page.reload()
    await expect(page.getByRole('tab', { name: 'API' })).toHaveAttribute('aria-selected', 'true')
    await expect(props).toBeVisible()
  })

  test('filters props in the API tab', async ({ page }) => {
    await open(page, '/components/button/?tab=api')
    const table = page.getByRole('table', { name: 'Button props', exact: true })
    const before = await table.getByRole('row').count()
    await page.getByRole('searchbox', { name: 'Filter props' }).fill('spinner')
    // Matches names, types and descriptions: only `loading` mentions a spinner.
    await expect(table.getByRole('row')).toHaveCount(2)
    await expect(table.getByText('loading', { exact: true })).toBeVisible()
    expect(before).toBeGreaterThan(2)
  })

  test('the table of contents scrolls to a section', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await open(page, '/components/button/')
    const toc = page.getByRole('navigation', { name: 'On this page' })
    await toc.getByRole('link', { name: 'Usage notes' }).click()
    await expect(page.locator('#usage-notes')).toBeInViewport()
    await expect(toc.getByRole('link', { name: 'Usage notes' })).toHaveAttribute(
      'aria-current',
      'location',
    )
  })

  test('the Accessibility tab lists keyboard interactions', async ({ page }) => {
    await open(page, '/components/slider/?tab=accessibility')
    const keys = page.getByRole('table', { name: 'Slider keyboard interactions' })
    await expect(keys.getByRole('row', { name: /Home/ })).toContainText('minimum or maximum')
  })

  test('links to the previous and next component', async ({ page }) => {
    await open(page, '/components/button/')
    await page
      .getByRole('navigation', { name: 'Previous and next components' })
      .getByRole('link')
      .click()
    await expect(page.getByRole('heading', { level: 1, name: 'CopyButton' })).toBeVisible()
  })
})

test.describe('Playground', () => {
  test('changing a control updates the preview and the code, and is shareable', async ({
    page,
  }) => {
    await open(page, '/components/button/?tab=playground')
    const playground = page.getByTestId('playground')
    const preview = playground.locator('[data-slot="playground-frame"]')
    await expect(preview.getByRole('button', { name: 'Save changes' })).toBeVisible()

    const props = playground.getByRole('region', { name: 'Button props' })
    await props.getByRole('textbox', { name: 'Children' }).fill('Publish')
    await props.getByRole('radio', { name: 'lg' }).click()
    await props.getByRole('switch', { name: 'Disabled' }).click()

    const button = preview.getByRole('button', { name: 'Publish' })
    await expect(button).toBeDisabled()
    const code = playground.locator('[data-slot="code-viewer"], pre').last()
    await expect(code).toContainText('<Button size="lg" disabled>Publish</Button>')

    // Values live in the URL, so a reload (or a shared link) restores them.
    await expect(page).toHaveURL(/p\.size=lg/)
    await page.reload()
    await expect(preview.getByRole('button', { name: 'Publish' })).toBeDisabled()

    await playground.getByRole('button', { name: 'Reset' }).click()
    await expect(preview.getByRole('button', { name: 'Save changes' })).toBeEnabled()
  })

  test('previews in another theme preset', async ({ page }) => {
    await open(page, '/components/badge/?tab=playground')
    const playground = page.getByTestId('playground')
    await playground.getByRole('combobox', { name: 'Preview theme' }).click()
    await page.getByRole('option', { name: 'Brutalist' }).click()
    await expect(
      playground.locator('[data-slot="playground-frame"] [data-glyph-theme="brutalist"]'),
    ).toBeVisible()
  })

  test('is hidden for components without one', async ({ page }) => {
    await open(page, '/components/app-shell/')
    await expect(page.getByRole('tab', { name: 'Examples' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Playground' })).toHaveCount(0)
  })
})
