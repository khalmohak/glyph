import { expect, test } from './fixtures'

test('navigation drawer opens, navigates and closes', async ({ page }) => {
  await page.goto('/app/invoices')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  await page
    .getByRole('button', { name: /open navigation|menu/i })
    .first()
    .click()
  await page.getByRole('link', { name: 'Customers' }).click()
  await expect(page).toHaveURL(/\/app\/customers$/)
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('landing page fits the screen', async ({ page }) => {
  await page.goto('/')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0)
  await page.getByRole('button', { name: /menu/i }).click()
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()
})
