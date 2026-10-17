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

test.describe('Motion', () => {
  test.describe('with motion allowed', () => {
    test.use({ reducedMotion: 'no-preference' })

    test('a menu springs in, animates out, then unmounts', async ({ page }) => {
      const preview = await example(page, 'dropdown-menu/actions')
      expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe('subtle')
      await preview.getByRole('button', { name: 'Project actions' }).click()
      const menu = page.getByRole('menu')
      await expect(menu).toBeVisible()
      expect(await menu.evaluate((el) => getComputedStyle(el).animationName)).toBe('glyph-pop-in')
      await page.keyboard.press('Escape')
      await expect(menu).toHaveCount(0)
    })

    test('the Tabs indicator slides to the clicked tab', async ({ page }) => {
      const preview = await example(page, 'motion/levels')
      const indicator = preview.locator('[role="tab"] [data-slot="indicator"]')
      const start = await indicator.boundingBox()
      await preview.getByRole('tab', { name: 'Settings' }).click()
      const settings = await preview.getByRole('tab', { name: 'Settings' }).boundingBox()
      // One indicator, now inside the clicked tab, having travelled there.
      await expect(indicator).toHaveCount(1)
      await expect
        .poll(async () => Math.round((await indicator.boundingBox())?.x ?? 0))
        .toBe(Math.round(settings?.x ?? -1))
      expect(start?.x).toBeLessThan(settings?.x ?? 0)
    })

    test('stagger cards reveal when they scroll into view', async ({ page }) => {
      const preview = await example(page, 'motion/reveal')
      const group = preview.locator('[data-slot="stagger"]')
      await expect(group).toHaveAttribute('data-stagger', 'shown')
      await expect(group.locator('[data-stagger-item]').last()).toHaveCSS('opacity', '1')
    })

    test('a motion: none theme renders statically', async ({ page }) => {
      const preview = await example(page, 'motion/levels')
      await preview.getByRole('radio', { name: 'None' }).click()
      const scope = preview.locator('[data-glyph-theme][data-motion]')
      await expect(scope).toHaveAttribute('data-motion', 'none')
      // Reveal and Stagger never hide content at level none.
      await expect(scope.locator('[data-slot="stagger"]')).not.toHaveAttribute('data-stagger')
      await scope.getByRole('tab', { name: 'Activity' }).click()
      const indicator = scope.locator('[role="tab"] [data-slot="indicator"]')
      // Static indicator: no motion transform applied mid-flight.
      expect(await indicator.evaluate((el) => (el as HTMLElement).style.transform)).toBe('')
    })
  })

  test('reduced motion turns animation off everywhere', async ({ page }) => {
    // The suite's default: reducedMotion 'reduce'.
    const preview = await example(page, 'dropdown-menu/actions')
    expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe('none')
    await preview.getByRole('button', { name: 'Project actions' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    const duration = await menu.evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).animationDuration),
    )
    expect(duration).toBeLessThan(0.01)
    await page.keyboard.press('Escape')
    await expect(menu).toHaveCount(0)
  })
})

test.describe('Charts', () => {
  test('legend hides and shows a series', async ({ page }) => {
    const preview = await example(page, 'chart/line')
    const curves = preview.locator('.recharts-line-curve')
    await expect(curves).toHaveCount(2)
    const costs = preview.getByRole('button', { name: 'Costs' })
    await costs.click()
    await expect(costs).toHaveAttribute('aria-pressed', 'false')
    await expect(curves).toHaveCount(1)
    await costs.press('Enter')
    await expect(costs).toHaveAttribute('aria-pressed', 'true')
    await expect(curves).toHaveCount(2)
  })

  test('shows a tooltip on hover', async ({ page }) => {
    const preview = await example(page, 'chart/bar')
    const plot = preview.locator('.recharts-surface').first()
    const box = (await plot.boundingBox())!
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.5)
    const tooltip = preview.locator('[data-slot=chart-tooltip]')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('Opened')
  })

  test('ChartCard switches to a table and back', async ({ page }) => {
    const preview = await example(page, 'chart-card/dashboard')
    const toggle = preview.getByRole('button', { name: 'View as table' })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await expect(preview.getByRole('table')).toBeVisible()
    await expect(preview.getByRole('columnheader', { name: 'Active' })).toBeVisible()
    await preview.getByRole('radio', { name: '7d' }).click()
    await expect(preview.locator('tbody tr')).toHaveCount(7)
    await toggle.click()
    await expect(preview.locator('.recharts-line-curve')).toHaveCount(2)
  })

  test('exports a chart as SVG with theme colors', async ({ page }) => {
    const preview = await example(page, 'chart-card/dashboard')
    await preview.getByRole('button', { name: 'Download chart' }).click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: 'Download SVG' }).click(),
    ])
    expect(download.suggestedFilename()).toBe('active-users.svg')
    const stream = await download.createReadStream()
    let svg = ''
    for await (const chunk of stream) svg += chunk
    expect(svg).toContain('<svg')
    expect(svg).not.toContain('var(--')
  })

  test('heatmap cells are reachable with the keyboard', async ({ page }) => {
    const preview = await example(page, 'heatmap/quarter')
    const grid = preview.getByRole('grid', { name: 'Support tickets, Q3' })
    await grid.getByRole('gridcell').first().focus()
    await page.keyboard.press('End')
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Sep 30, 2026/)
    await page.keyboard.press('ArrowLeft')
    await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Sep 23, 2026/)
    await page.keyboard.press('Enter')
    await expect(preview).toContainText('Opened Sep 23, 2026')
  })
})

test.describe('DataTable v2', () => {
  const bodyRows = (preview: import('@playwright/test').Locator) =>
    preview.locator('tbody tr:not([aria-hidden])')

  test('server mode pages, sorts and filters through the API, keeping rows while loading', async ({
    page,
  }) => {
    const preview = await example(page, 'data-table/server')
    await expect(preview).toContainText('1–10 of 312')
    await preview.getByRole('button', { name: 'Page 2' }).click()
    // The current rows stay under a progress bar until the next page arrives.
    await expect(preview.locator('table')).toHaveAttribute('aria-busy', 'true')
    await expect(bodyRows(preview)).toHaveCount(10)
    await expect(preview).toContainText('11–20 of 312')
    await expect(preview.locator('table')).not.toHaveAttribute('aria-busy', 'true')

    await preview.getByRole('button', { name: 'Filter', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Status' }).click()
    await page.getByRole('option', { name: /Overdue/ }).click()
    await page.keyboard.press('Escape')
    await expect(preview.getByRole('button', { name: 'Edit Status filter' })).toHaveText('Overdue')
    await expect(preview).toContainText(/1–10 of 4\d(?!\d)/)
    for (const badge of await preview.locator('tbody [data-slot="badge"]').all())
      await expect(badge).toHaveText('overdue')

    await preview.getByRole('checkbox', { name: 'Select all rows on this page' }).click()
    await preview.getByRole('button', { name: /^Select all \d+$/ }).click()
    await expect(preview.getByRole('toolbar', { name: 'Bulk actions' })).toContainText(
      /All \d+ selected/,
    )
  })

  test('keeps filters, page and sort in the URL, and the back button works', async ({ page }) => {
    const preview = await example(page, 'data-table/url-state')
    await preview.getByRole('button', { name: 'Page 2' }).click()
    await expect(page).toHaveURL(/orders\.page=2/)
    const firstOnPage2 = await bodyRows(preview).first().textContent()

    await preview.getByRole('button', { name: 'Customer', exact: true }).click()
    await expect(page).toHaveURL(/orders\.sort=customer/)
    await expect(page).not.toHaveURL(/orders\.page=/)

    await preview.getByRole('button', { name: 'Filter', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Status' }).click()
    await page.getByRole('option', { name: /Paid/ }).click()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/orders\.f\.status=paid/)

    // Reload: the view comes back from the URL.
    await page.reload({ waitUntil: 'networkidle' })
    const restored = page.locator('[data-example="data-table/url-state"]')
    await expect(restored.getByRole('button', { name: 'Edit Status filter' })).toHaveText('Paid')

    await page.goBack()
    await page.goBack()
    await expect(page).toHaveURL(/orders\.page=2/)
    await expect(bodyRows(restored).first()).toHaveText(firstOnPage2 ?? '')
  })

  test('hides, resizes and pins columns', async ({ page }) => {
    const preview = await example(page, 'data-table/columns')
    const header = preview.getByRole('columnheader', { name: /Billing email/ })
    await header.hover()
    await preview.getByRole('button', { name: 'Billing email column options' }).click()
    await page.getByRole('menuitem', { name: 'Hide column' }).click()
    await expect(header).toHaveCount(0)

    const plan = preview.getByRole('columnheader', { name: /Plan/ })
    const before = (await plan.boundingBox())!.width
    const handle = preview.getByRole('separator', { name: 'Resize Plan column' })
    const box = (await handle.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 80, box.y + box.height / 2, { steps: 5 })
    await page.mouse.up()
    await expect.poll(async () => (await plan.boundingBox())!.width).toBeGreaterThan(before + 60)

    // The pinned Invoice column stays put while the table scrolls sideways.
    const pinned = preview.getByRole('columnheader', { name: /Invoice/ })
    const x = (await pinned.boundingBox())!.x
    await preview.locator('[data-slot="data-table-scroller"]').evaluate((el) => {
      el.scrollLeft = 300
    })
    await expect(pinned).toHaveAttribute('data-scrolled', 'true')
    expect((await pinned.boundingBox())!.x).toBeCloseTo(x, 0)
  })

  test('bulk-deletes selected rows after confirming', async ({ page }) => {
    const preview = await example(page, 'data-table/bulk-actions')
    const boxes = preview.getByRole('checkbox', { name: 'Select row' })
    await boxes.nth(0).click()
    await boxes.nth(1).click()
    const bar = preview.getByRole('toolbar', { name: 'Bulk actions' })
    await expect(bar).toContainText('2 selected')
    await bar.getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click()
    await expect(page.getByText('2 invoices deleted')).toBeVisible()
    await expect(bar).toHaveCount(0)
    await expect(preview).toContainText('of 46')
  })

  test('downloads the visible page as CSV', async ({ page }) => {
    const preview = await example(page, 'data-table/export')
    await preview.getByRole('button', { name: 'Export' }).click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('menuitem', { name: /This page/ }).click(),
    ])
    expect(download.suggestedFilename()).toBe('invoices.csv')
    let csv = ''
    for await (const chunk of await download.createReadStream()) csv += chunk
    const lines = csv.replace(/^﻿/, '').split('\r\n')
    expect(lines[0]).toBe('Invoice,Customer,Billing email,Total')
    expect(lines).toHaveLength(6)
    expect(lines[1]).toMatch(/^INV-\d+,[^,]+,billing@[a-z]+\.com,\d+\.\d{2}$/)
  })

  test('a row click opens details; checkboxes keep their own clicks', async ({ page }) => {
    const preview = await example(page, 'data-table/row-click')
    await preview.getByRole('checkbox', { name: 'Select row' }).first().click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await bodyRows(preview).nth(1).getByRole('cell').nth(2).click()
    await expect(page.getByRole('dialog', { name: 'INV-1041' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await bodyRows(preview).nth(2).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog', { name: 'INV-1042' })).toBeVisible()
  })

  test('expands a row and edits a cell in place', async ({ page }) => {
    const expand = await example(page, 'data-table/expandable')
    await expand.getByRole('button', { name: 'Show details' }).first().click()
    await expect(expand.getByText('billing@northwind.com')).toBeVisible()
    await expand.getByRole('button', { name: 'Hide details' }).click()
    await expect(expand.getByText('billing@northwind.com')).toHaveCount(0)

    const edit = page.locator('[data-example="data-table/editing"]')
    await edit.scrollIntoViewIfNeeded()
    await edit.getByRole('button', { name: 'Edit Seats' }).first().click()
    await page.keyboard.type('80')
    await page.keyboard.press('Enter')
    // Rejected by the "server": rolls back to 8.
    await expect(edit.getByRole('button', { name: 'Edit Seats' }).first()).toHaveText('8')
    await edit.getByRole('button', { name: 'Edit Seats' }).first().click()
    await page.keyboard.type('12')
    await page.keyboard.press('Enter')
    await expect(edit.getByRole('button', { name: 'Edit Seats' }).first()).toHaveText('12')
  })

  test('shows rows as cards on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    const preview = await example(page, 'data-table/mobile-cards')
    await expect(preview.locator('table')).toHaveCount(0)
    const cards = preview.locator('[data-slot="data-table-cards"] > li')
    await expect(cards).toHaveCount(4)
    await expect(cards.first()).toContainText('Northwind')
    await expect(cards.first()).not.toContainText('Billing email')
  })

  test('scrolls 10,000 virtualized rows smoothly', async ({ page }) => {
    const preview = await example(page, 'data-table-virtual/ten-thousand')
    const table = preview.getByRole('table')
    await expect(table).toHaveAttribute('aria-rowcount', '10001')
    const rendered = await bodyRows(preview).count()
    expect(rendered).toBeLessThan(60)
    const scroller = preview.locator('[data-slot="data-table-scroller"]')
    const elapsed = await scroller.evaluate(async (el) => {
      const start = performance.now()
      for (let i = 1; i <= 20; i++) {
        el.scrollTop = (el.scrollHeight / 20) * i
        await new Promise(requestAnimationFrame)
      }
      return performance.now() - start
    })
    // 20 jumps across the list in well under a second, about one frame each.
    expect(elapsed).toBeLessThan(1500)
    // Rows are measured as they render, so the list's height settles; follow it to the end.
    await expect
      .poll(() =>
        scroller.evaluate((el) => {
          el.scrollTop = el.scrollHeight
          return bodyRowsText(el)
          function bodyRowsText(root: Element) {
            const rows = root.querySelectorAll('tbody tr:not([aria-hidden])')
            return rows[rows.length - 1]?.textContent ?? ''
          }
        }),
      )
      .toContain('INV-11039')
    expect(await bodyRows(preview).count()).toBeLessThan(60)
  })
})
