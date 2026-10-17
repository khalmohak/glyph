import { example, expect, prepare, test } from './fixtures'

/** Interaction tests for the hard components, driven through their docs examples. */

test.beforeEach(async ({ page }) => {
  await prepare(page, { mode: 'light', motion: true })
})

test.describe('DataTable', () => {
  test('sorts, searches, paginates and selects', async ({ page }) => {
    const table = await example(page, 'data-table/basic')
    const header = table.getByRole('columnheader', { name: /Customer/ })

    await table.getByRole('button', { name: 'Customer' }).click()
    await expect(header).toHaveAttribute('aria-sort', 'ascending')
    await table.getByRole('button', { name: 'Customer' }).click()
    await expect(header).toHaveAttribute('aria-sort', 'descending')

    const rows = table.locator('tbody tr')
    await expect(rows).toHaveCount(4)
    await table.getByRole('button', { name: 'Next page' }).click()
    await expect(rows).toHaveCount(1)
    await table.getByRole('button', { name: 'Previous page' }).click()
    await expect(rows).toHaveCount(4)

    await table.getByRole('searchbox').fill('globex')
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('Globex')
    await table.getByRole('searchbox').fill('zzz')
    await table.getByRole('button', { name: 'Clear search' }).click()
    await expect(rows).toHaveCount(4)

    await table.getByRole('checkbox', { name: /Select all/ }).click()
    for (const box of await table.getByRole('checkbox', { name: 'Select row' }).all()) {
      await expect(box).toBeChecked()
    }
    await expect(table).toContainText('4 selected')
  })

  test('shows loading, error and empty states', async ({ page }) => {
    const preview = await example(page, 'data-table/states')
    await expect(preview.locator('tbody [data-slot="skeleton"]').first()).toBeVisible()
    await preview.getByRole('radio', { name: 'Error' }).click()
    await expect(preview).toContainText('Could not reach the deploy service.')
    await preview.getByRole('button', { name: 'Try again' }).click()
    await expect(preview).toContainText('No rows yet')
  })
})

test.describe('Modal', () => {
  test('opens, traps focus and closes on Escape', async ({ page }) => {
    const preview = await example(page, 'modal/basic')
    const trigger = preview.getByRole('button', { name: 'Invite' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Invite teammates' })
    await expect(dialog).toBeVisible()

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('form example submits and closes', async ({ page }) => {
    const preview = await example(page, 'modal/form')
    await preview.getByRole('button', { name: 'New project' }).click()
    const dialog = page.getByRole('dialog', { name: 'New project' })
    await dialog.getByRole('textbox', { name: /Name/ }).fill('Website redesign')
    await dialog.getByRole('button', { name: 'Create project' }).click()
    await expect(page.getByText('Project created')).toBeVisible()
    await expect(dialog).toBeHidden()
  })
})

test.describe('useConfirm', () => {
  test('resolves true on confirm and false on cancel', async ({ page }) => {
    const preview = await example(page, 'alert-dialog/use-confirm')
    const open = () => preview.getByRole('button', { name: 'Delete project' }).click()

    await open()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText('Website redesign')
    await dialog.getByRole('button', { name: /cancel/i }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText('Project deleted')).toHaveCount(0)

    await open()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^(delete|confirm)/i })
      .click()
    await expect(page.getByText('Project deleted')).toBeVisible()
  })
})

test.describe('Carousel', () => {
  test('moves with buttons and arrow keys', async ({ page }) => {
    const preview = await example(page, 'carousel/multiple')
    const prev = preview.getByRole('button', { name: 'Previous slide' })
    const next = preview.getByRole('button', { name: 'Next slide' })
    await expect(prev).toBeDisabled()

    await next.click()
    await expect(prev).toBeEnabled()
    await prev.click()
    await expect(prev).toBeDisabled()

    // Arrow keys work while focus is anywhere inside the carousel.
    await next.focus()
    await page.keyboard.press('ArrowRight')
    await expect(prev).toBeEnabled()
    await page.keyboard.press('ArrowLeft')
    await expect(prev).toBeDisabled()
  })
})

test.describe('CommandMenu', () => {
  test('opens with the shortcut, filters and runs a command', async ({ page }) => {
    const preview = await example(page, 'command-menu/basic')
    await page.keyboard.press('ControlOrMeta+k')
    const input = page.getByPlaceholder('Type a command or search…')
    await expect(input).toBeVisible()
    await input.fill('invite')
    await expect(page.getByRole('option')).toHaveCount(1)
    await page.keyboard.press('Enter')
    await expect(input).toBeHidden()
    await expect(preview).toContainText('Ran: Invite people')
  })
})

test.describe('Sheet', () => {
  test('opens from the chosen side and closes', async ({ page }) => {
    const preview = await example(page, 'sheet/sides')
    await preview.getByRole('button', { name: 'left' }).click()
    const sheet = page.getByRole('dialog', { name: /left sheet/i })
    await expect(sheet).toBeVisible()
    const box = await sheet.boundingBox()
    expect(box?.x).toBe(0)
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
  })
})

test.describe('Accordion', () => {
  test('collapses an open item', async ({ page }) => {
    const preview = await example(page, 'accordion/faq')
    const trigger = preview.getByRole('button', { name: 'Is Glyph free?' })
    const panel = preview.getByText('Both packages are MIT licensed')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(panel).toBeVisible()
    await trigger.click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(panel).toBeHidden()
  })
})

test.describe('DatePicker', () => {
  test('picks a day', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-14T10:00:00'))
    const preview = await example(page, 'date-picker/basic')
    await preview
      .getByRole('button', { name: /pick a date|launch date/i })
      .first()
      .click()
    const grid = page.getByRole('grid')
    await expect(grid).toBeVisible()
    await page.getByRole('button', { name: /October 16(th)?, 2026/ }).click()
    await expect(grid).toBeHidden()
    await expect(preview).toContainText(/Oct(ober)? 16/)
  })
})

test.describe('Combobox', () => {
  test('filters by keyword and selects', async ({ page }) => {
    const preview = await example(page, 'combobox/basic')
    await preview.getByRole('combobox').click()
    await page.keyboard.type('pacific')
    const options = page.getByRole('option')
    await expect(options).toHaveCount(1)
    await expect(options.first()).toContainText('Los Angeles')
    await options.first().click()
    await expect(preview.getByRole('combobox')).toContainText('Los Angeles')
  })
})

test.describe('Toast', () => {
  test('shows a toast with its description', async ({ page }) => {
    const preview = await example(page, 'toast/types')
    await preview.getByRole('button', { name: 'Success' }).click()
    const toast = page.locator('[data-sonner-toast]').first()
    await expect(toast).toContainText('Invoice sent')
    await expect(toast).toContainText('Acme Inc. will get it by email.')
  })
})
