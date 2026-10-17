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
    const table = page.getByRole('table', { name: 'Invoices' })
    await page.getByRole('button', { name: 'Actions for INV-1040' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    const confirm = page.getByRole('alertdialog')
    await confirm.getByRole('button', { name: 'Cancel' }).click()
    await expect(table.getByText('INV-1040', { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Actions for INV-1040' }).click()
    await page.getByRole('menuitem', { name: 'Delete' }).click()
    await confirm.getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('Invoice deleted')).toBeVisible()
    await expect(table.getByText('INV-1040', { exact: true })).toBeHidden()
  })

  test('filters by status with a chip and bulk-deletes the selection', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Invoices' })
    await expect(table.locator('tbody tr')).toHaveCount(10)
    await page.getByRole('button', { name: 'Filter', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Status' }).click()
    // Counts come from the server.
    await expect(page.getByRole('option', { name: /Overdue/ })).toContainText('5')
    await page.getByRole('option', { name: /Overdue/ }).click()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/f\.status=overdue/)
    await expect(table.locator('tbody tr')).toHaveCount(5)
    await page.getByRole('checkbox', { name: 'Select all rows on this page' }).click()
    const bar = page.getByRole('toolbar', { name: 'Bulk actions' })
    await bar.getByRole('button', { name: 'Delete 5' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('5 invoices deleted')).toBeVisible()
    await expect(page.getByText('No rows match these filters')).toBeVisible()
  })

  test('pages through the server and back with the browser', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Invoices' })
    await expect(page.getByText('1–10 of 37')).toBeVisible()
    await page.getByRole('button', { name: 'Page 2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByText('11–20 of 37')).toBeVisible()
    await expect(table.locator('tbody tr').first()).toContainText('INV-1050')
    await page.goBack()
    await expect(page.getByText('1–10 of 37')).toBeVisible()
    await expect(table.locator('tbody tr').first()).toContainText('INV-1040')
  })

  test('opens invoice details from a row', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Invoices' })
    await table.getByText('INV-1042').click()
    const sheet = page.getByRole('dialog', { name: 'INV-1042' })
    await expect(sheet).toBeVisible()
    await expect(sheet).toContainText('Initech')
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })

  test('exports every matching invoice as CSV', async ({ page }) => {
    await page.getByRole('button', { name: 'Export' }).click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'All rows' }).click(),
    ])
    expect(download.suggestedFilename()).toBe('invoices.csv')
    let csv = ''
    for await (const chunk of await download.createReadStream()) csv += chunk
    const lines = csv.replace(/^\uFEFF/, '').split('\r\n')
    expect(lines[0]).toBe('Invoice,Customer,Status,Due,Total')
    expect(lines).toHaveLength(38)
  })
})

test('a shared link with one status filter loads and can add another', async ({ page }) => {
  // A single value in the URL used to decode as a string where the filter needs an array.
  await page.goto('/app/invoices?f.status=overdue')
  const table = page.getByRole('table', { name: 'Invoices' })
  await expect(table.locator('tbody tr')).toHaveCount(5)
  await page
    .getByRole('button', { name: /Status/ })
    .first()
    .click()
  await page.getByRole('option', { name: /Open/ }).click()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/f\.status=overdue&f\.status=open|f\.status=open&f\.status=overdue/)
  await expect(table.locator('tbody tr')).not.toHaveCount(5)
})

test('command menu opens an invoice in the table', async ({ page }) => {
  await page.goto('/app')
  await page.keyboard.press('ControlOrMeta+k')
  await page.getByPlaceholder('Search pages and invoices…').fill('INV-1043')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/app\/invoices\?q=INV-1043$/)
  await expect(page.getByRole('searchbox', { name: 'Search rows' })).toHaveValue('INV-1043')
  const rows = page.getByRole('table', { name: 'Invoices' }).locator('tbody tr')
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('Umbrella')
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
