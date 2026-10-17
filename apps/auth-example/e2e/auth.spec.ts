import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  ;(page as Page & { errors?: string[] }).errors = errors
})

test.afterEach(async ({ page }) => {
  expect((page as Page & { errors?: string[] }).errors ?? []).toEqual([])
})

const inbox = (page: Page) => page.getByRole('region', { name: 'Dev inbox' })

/** The newest code the fake server "emailed". */
async function latestCode(page: Page) {
  const code = inbox(page).getByTestId('inbox-code').first()
  await expect(code).toBeVisible()
  return (await code.textContent())?.trim() ?? ''
}

async function signIn(page: Page, email: string, password: string) {
  await page.getByRole('textbox', { name: 'Email' }).fill(email)
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}

test('sign up, verify the email code, use the app and sign out', async ({ page }) => {
  await page.goto('/sign-up')
  await page.getByRole('textbox', { name: 'Name' }).fill('Alan Turing')
  await page.getByRole('textbox', { name: 'Email' }).fill('alan@example.com')
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('enigma machine')
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Verification code' }).fill(await latestCode(page))

  await expect(page).toHaveURL(/\/app$/)
  await expect(page.getByRole('heading', { name: 'Welcome back, Alan Turing' })).toBeVisible()
  await expect(page.getByRole('table', { name: 'Invoices' })).toBeVisible()

  await page.getByRole('button', { name: /alan@example\.com/ }).click()
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/)
  await page.goto('/app')
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp$/)
})

test('a deep link survives sign-in, and signed-in users skip the sign-in page', async ({
  page,
}) => {
  await page.goto('/app/billing?tab=invoices')
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp%2Fbilling%3Ftab%3Dinvoices$/)
  await signIn(page, 'ada@example.com', 'correct horse')
  await expect(page).toHaveURL(/\/app\/billing\?tab=invoices$/)
  await expect(page.getByRole('heading', { name: 'Billing' })).toBeVisible()

  await page.goto('/sign-in')
  await expect(page).toHaveURL(/\/app$/)
})

test('a wrong password shows an error and keeps the email', async ({ page }) => {
  await page.goto('/sign-in')
  await signIn(page, 'ada@example.com', 'wrong')
  await expect(page.getByText('That email and password don’t match.')).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue('ada@example.com')
})

test('two-step sign-in with an emailed code', async ({ page }) => {
  await page.goto('/sign-in')
  await signIn(page, 'grace@example.com', 'cobol rules')
  await expect(page.getByRole('heading', { name: 'Two-step verification' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Authentication code' }).fill('000000')
  await expect(page.getByText(/That code isn’t right/)).toBeVisible()
  await page.getByRole('textbox', { name: 'Authentication code' }).fill(await latestCode(page))
  await expect(page).toHaveURL(/\/app$/)
})

test('role and permission checks show a fallback', async ({ page }) => {
  await page.goto('/sign-in?next=%2Fapp%2Fadmin')
  await signIn(page, 'grace@example.com', 'cobol rules')
  await page.getByRole('textbox', { name: 'Authentication code' }).fill(await latestCode(page))
  await expect(page.getByText('You don’t have access to this page')).toBeVisible()
  await page.getByRole('link', { name: /Billing/ }).click()
  await expect(page.getByText('You don’t have access to this page')).toBeVisible()
})

test('forgot and reset password through the emailed link', async ({ page }) => {
  await page.goto('/sign-in')
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.com')
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByText(/If an account exists for ada@example.com/)).toBeVisible()

  await inbox(page).getByRole('link', { name: 'Open link' }).first().click()
  await expect(page).toHaveURL(/\/reset-password\?token=/)
  await page.getByRole('textbox', { name: 'New password', exact: true }).fill('a brand new one')
  await page.getByRole('textbox', { name: 'Repeat new password' }).fill('a brand new one')
  await page.getByRole('button', { name: 'Update password' }).click()
  await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign in' }).click()
  await signIn(page, 'ada@example.com', 'a brand new one')
  await expect(page).toHaveURL(/\/app$/)
})

test('an expired session asks to sign in again without leaving the page', async ({ page }) => {
  await page.goto('/sign-in')
  await signIn(page, 'ada@example.com', 'correct horse')
  await expect(page.getByRole('table', { name: 'Invoices' })).toBeVisible()

  await page.getByRole('button', { name: 'Simulate session expiry' }).click()
  // Wait for the server to revoke the tokens before making the next request.
  await expect(page.getByText(/Session revoked on the server/)).toBeVisible()
  await page.getByRole('button', { name: 'Refresh invoices' }).click()
  const dialog = page.getByRole('dialog', { name: 'Your session expired' })
  await expect(dialog).toBeVisible()
  await dialog.getByRole('textbox', { name: 'Password', exact: true }).fill('correct horse')
  await dialog.getByRole('button', { name: 'Sign in' }).click()
  await expect(dialog).toBeHidden()
  await page.getByRole('button', { name: 'Refresh invoices' }).click()
  await expect(page.getByRole('table', { name: 'Invoices' })).toBeVisible()
  await expect(page).toHaveURL(/\/app$/)
})

test('switching organizations updates the app', async ({ page }) => {
  await page.goto('/sign-in')
  await signIn(page, 'ada@example.com', 'correct horse')
  await page.getByRole('button', { name: /Analytical Engines/ }).click()
  await page.getByRole('menuitemradio', { name: /Difference Ltd/ }).click()
  await expect(page.getByText('Switched to Difference Ltd')).toBeVisible()
  await expect(page.getByRole('button', { name: /Difference Ltd/ })).toBeVisible()
})

test('signing out in another tab signs this tab out too', async ({ page, context }) => {
  await page.goto('/sign-in')
  await signIn(page, 'ada@example.com', 'correct horse')
  await expect(page).toHaveURL(/\/app$/)

  const second = await context.newPage()
  await second.goto('/app')
  await expect(second.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  await second.getByRole('button', { name: /ada@example\.com/ }).click()
  await second.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(second).toHaveURL(/\/sign-in$/)

  await expect(page).toHaveURL(/\/sign-in\?next=%2Fapp$/)
})
