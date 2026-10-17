import { expect, open, prepare, test } from './fixtures'

/** Guides, the changelog and the Markdown exports. */

test.beforeEach(async ({ page }) => {
  await prepare(page, { mode: 'light', motion: true })
})

test.describe('Guides', () => {
  test('render with a table of contents, and open at a heading from a link', async ({ page }) => {
    await open(page, '/docs/theming/#dark-mode')
    const heading = page.getByRole('heading', { level: 2, name: 'Dark mode' })
    await expect(heading).toBeInViewport()
    const toc = page.getByRole('navigation', { name: 'On this page' })
    await expect(toc.getByRole('link', { name: 'Color tokens' })).toBeVisible()
    await toc.getByRole('link', { name: 'Component recipes' }).click()
    await expect(
      page.getByRole('heading', { level: 2, name: 'Component recipes' }),
    ).toBeInViewport()
  })

  test('embed live examples and highlighted code with a file name', async ({ page }) => {
    await open(page, '/docs/forms/')
    await expect(page.locator('[data-example="form/signup"]')).toBeVisible()
    await expect(page.getByText('src/signup-form.tsx')).toBeVisible()
  })

  test('remember the package manager across install blocks and visits', async ({ page }) => {
    await open(page, '/docs/getting-started/')
    const tabs = page.getByRole('tablist', { name: 'Package manager' }).first()
    await tabs.getByRole('tab', { name: 'pnpm' }).click()
    await expect(page.getByText('pnpm add @glyphui/ui', { exact: true })).toBeVisible()
    await open(page, '/docs/forms/')
    await expect(page.getByText('pnpm add react-hook-form @hookform/resolvers zod')).toBeVisible()
  })

  test('move to the next guide', async ({ page }) => {
    await open(page, '/docs/getting-started/')
    await page
      .getByRole('navigation', { name: 'More guides' })
      .getByRole('link', { name: /Theming/ })
      .click()
    await expect(page.getByRole('heading', { level: 1, name: 'Theming' })).toBeVisible()
  })

  test('copy the page as Markdown', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await open(page, '/docs/motion/')
    await page.getByRole('button', { name: 'Copy page' }).click()
    await expect(page.getByText('Copied page as Markdown')).toBeVisible()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('# Motion')
    expect(copied).toContain('```tsx title="src/layout.tsx"')
  })
})

test.describe('Changelog', () => {
  test('filters releases by package, in the URL', async ({ page }) => {
    await open(page, '/changelog/')
    await expect(page.getByRole('heading', { level: 1, name: 'Changelog' })).toBeVisible()
    await page.getByRole('radio', { name: 'auth' }).click()
    await expect(page).toHaveURL(/package=%40glyphui%2Fauth/)
    // Every listed entry touches @glyphui/auth.
    const entries = page.locator('main ol > li')
    await expect(entries.first()).toBeVisible()
    for (const entry of await entries.all())
      await expect(entry.getByText('auth', { exact: true })).toBeVisible()
  })
})

test.describe('Markdown exports', () => {
  test('serve llms.txt, llms-full.txt and a .md page per guide and component', async ({
    request,
  }) => {
    const index = await request.get('/llms.txt')
    expect(index.ok()).toBe(true)
    const text = await index.text()
    expect(text).toContain('# Glyph')
    expect(text).toContain('/docs/data-tables.md')
    expect(text).toContain('/components/button.md')
    for (const path of [
      '/llms-full.txt',
      '/docs/auth.md',
      '/components/data-table.md',
      '/changelog.md',
    ]) {
      const res = await request.get(path)
      expect(res.ok(), path).toBe(true)
    }
  })
})
