import { expect, test } from './fixtures'

test.describe('invoices', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app/invoices')
  })

  test('validates and creates an invoice from the modal', async ({ page }) => {
    await page.getByRole('button', { name: 'New invoice' }).click()
    const dialog = page.getByRole('dialog', { name: 'New invoice' })
    await dialog.getByRole('button', { name: 'Create invoice' }).click()
    await expect(dialog.getByText('Enter an amount')).toBeVisible()
    await expect(dialog.getByText('Choose a due date')).toBeVisible()

    await dialog.getByRole('combobox', { name: 'Customer' }).click()
    await page.getByRole('option', { name: 'Globex' }).click()
    await dialog.getByRole('spinbutton', { name: 'Amount' }).fill('1250')
    await dialog.getByRole('button', { name: /due date/i }).click()
    await page.locator('[role="grid"] button:not([disabled])').nth(3).click()
    await dialog.getByRole('button', { name: 'Create invoice' }).click()

    await expect(page.getByText('Invoice created')).toBeVisible()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(/38 invoices/)).toBeVisible()
  })

  test('shows a server-side error on the right field', async ({ page }) => {
    await page.getByRole('button', { name: 'New invoice' }).click()
    const dialog = page.getByRole('dialog', { name: 'New invoice' })
    await dialog.getByRole('combobox', { name: 'Customer' }).click()
    await page.getByRole('option', { name: 'Hooli' }).click()
    await dialog.getByRole('spinbutton', { name: 'Amount' }).fill('90000')
    await dialog.getByRole('button', { name: /due date/i }).click()
    await page.locator('[role="grid"] button:not([disabled])').nth(3).click()
    await dialog.getByRole('button', { name: 'Create invoice' }).click()
    await expect(dialog.getByText('Invoices over $50,000 need approval.')).toBeVisible()
  })

  test('deletes a row after confirming', async ({ page }) => {
    await page.getByRole('button', { name: 'Actions for INV-1040' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    const confirm = page.getByRole('alertdialog')
    await confirm.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('INV-1040', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Actions for INV-1040' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await confirm.getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('Invoice deleted')).toBeVisible()
    await expect(page.getByText('INV-1040', { exact: true })).toBeHidden()
  })

  test('filters by status and bulk-deletes the selection', async ({ page }) => {
    await page.getByRole('radio', { name: 'Overdue' }).click()
    await expect(page.locator('tbody tr')).toHaveCount(5)
    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click()
    await page.getByRole('button', { name: 'Delete 5' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('5 invoices deleted')).toBeVisible()
  })
})

test('command menu navigates and closes', async ({ page }) => {
  await page.goto('/app')
  await page.keyboard.press('ControlOrMeta+k')
  const input = page.getByPlaceholder('Search pages and invoices…')
  await input.fill('custom')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/app\/customers$/)
  await expect(input).toBeHidden()
})

test('sidebar marks the current page', async ({ page }) => {
  await page.goto('/app/customers')
  const nav = page.getByRole('complementary')
  await expect(nav.getByRole('link', { name: 'Customers' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
})

test('customer sheet opens and closes', async ({ page }) => {
  await page.goto('/app/customers')
  await page.getByRole('button', { name: /Globex/ }).click()
  const sheet = page.getByRole('dialog', { name: 'Globex' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByText('hank@globex.com')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
})

test('settings form validates', async ({ page }) => {
  await page.goto('/app/settings')
  await page.getByRole('textbox', { name: /Company name/ }).fill('')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Use at least 2 characters')).toBeVisible()
  await page.getByRole('textbox', { name: /Company name/ }).fill('Acme')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Profile saved')).toBeVisible()
})

test('sign in rejects a bad password, then enters the app', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('textbox', { name: 'Email' }).fill('ada@ledgerline.app')
  const password = page.getByRole('textbox', { name: 'Password', exact: true })
  await password.fill('wrong')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('That email and password don’t match.')).toBeVisible()
  await password.fill('correct horse')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/app$/)
})

test('landing CTAs navigate client-side', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    ;(window as unknown as { marker: number }).marker = 1
  })
  await page.getByRole('link', { name: 'Start 14-day trial' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1)
})

test('color mode persists across reloads without a flash', async ({ page }) => {
  await page.goto('/app/settings')
  await page.getByRole('tab', { name: 'Appearance' }).click()
  await page.getByRole('radio', { name: 'Light' }).click()
  await page.reload()
  // The injected script sets data-mode before React runs.
  expect(await page.evaluate(() => document.documentElement.dataset.mode)).toBe('light')
})
