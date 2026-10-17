import { example, expect, open, prepare, test } from './fixtures'

/** Interaction tests for the hard components, driven through their docs examples. */

test.beforeEach(async ({ page }) => {
  await prepare(page, { mode: 'light', motion: true })
})

test.describe('Docs navigation', () => {
  // Route changes run effect cleanups; a bad cleanup (e.g. returning scrollTo's Promise in
  // newer Chrome) crashes the page on the second navigation.
  test('moves between pages from the sidebar without errors', async ({ page }) => {
    await open(page, '/components/button/')
    const nav = page.getByRole('complementary')
    for (const name of ['Badge', 'Card', 'Tabs', 'Button']) {
      await nav.getByRole('link', { name, exact: true }).click()
      await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
    }
  })

  test('reaches every section from the header', async ({ page }) => {
    await open(page, '/')
    const header = page.getByRole('navigation', { name: 'Main' })
    for (const [link, heading] of [
      ['Docs', 'Build with Glyph'],
      ['Components', 'Components'],
      ['Blocks', 'Page sections, ready to drop in'],
      ['Themes', 'Design your theme'],
      ['Templates', 'Real apps, built only with Glyph'],
    ] as const) {
      await header.getByRole('link', { name: link, exact: true }).click()
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      await expect(header.getByRole('link', { name: link, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      )
    }
  })

  test('guides link through to component pages', async ({ page }) => {
    await open(page, '/docs/auth/')
    await expect(page.getByRole('heading', { level: 1, name: 'Authentication' })).toBeVisible()
    await page.getByRole('link', { name: 'Firebase', exact: true }).click()
    await expect(page.getByRole('heading', { level: 1, name: /Firebase/ })).toBeVisible()
  })
})

test.describe('Gallery', () => {
  test('filters by search, status and category, kept in the URL', async ({ page }) => {
    await open(page, '/components/')
    const search = page.getByRole('searchbox', { name: 'Search components' })
    await search.fill('date')
    await expect(page).toHaveURL(/[?&]q=date/)
    const cards = page.getByRole('main').getByRole('listitem')
    await expect(cards.getByRole('link', { name: /^DatePicker:/ })).toBeVisible()
    await expect(cards.getByRole('link', { name: /^Button:/ })).toHaveCount(0)

    await search.fill('zzzz')
    await expect(page.getByText('No components match')).toBeVisible()
    await page.getByRole('button', { name: 'Clear filters' }).first().click()
    await expect(search).toHaveValue('')

    await page
      .getByRole('radiogroup', { name: 'Category' })
      .getByRole('radio', { name: 'Viewers' })
      .click()
    await expect(page).toHaveURL(/category=Viewers/)
    await expect(cards.getByRole('link', { name: /^PdfViewer:/ })).toBeVisible()
    await expect(cards.getByRole('link', { name: /^Button:/ })).toHaveCount(0)

    // A shared link restores the same view.
    await page.reload()
    await expect(
      page.getByRole('radiogroup', { name: 'Category' }).getByRole('radio', { name: 'Viewers' }),
    ).toHaveAttribute('aria-checked', 'true')
    await cards.getByRole('link', { name: /^PdfViewer:/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'PdfViewer' })).toBeVisible()
  })

  test('renders live previews as cards scroll into view', async ({ page }) => {
    await open(page, '/components/?category=Actions')
    const preview = page.locator('[data-preview]').first()
    await expect(preview).toBeAttached()
    // Previews are aria-hidden (the card carries the name), so query the DOM, not roles.
    await expect(preview.locator('button').first()).toBeAttached()
  })
})

test.describe('Home', () => {
  test('restyles the live mock, and can apply that theme to the whole site', async ({ page }) => {
    await open(page, '/')
    const mock = page
      .locator('[data-glyph-theme]')
      .filter({ has: page.getByText('Ledgerline') })
      .first()
    await expect(mock).toHaveAttribute('data-glyph-theme', 'glyph')
    await page
      .getByRole('radiogroup', { name: 'Preview theme' })
      .getByRole('radio', { name: 'Brutalist' })
      .click()
    await expect(mock).toHaveAttribute('data-glyph-theme', 'brutalist')

    await page.getByRole('button', { name: 'Use Brutalist for the whole site' }).click()
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('glyph-docs-theme')))
      .toBe('brutalist')
  })

  test('the mock is interactive: its modal opens and creates an invoice', async ({ page }) => {
    await open(page, '/')
    await page.getByRole('button', { name: 'New invoice' }).click()
    const dialog = page.getByRole('dialog', { name: 'New invoice' })
    await expect(dialog).toBeVisible()
    await dialog.getByRole('button', { name: 'Create invoice' }).click()
    await expect(page.getByText('Invoice created')).toBeVisible()
  })
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
    // It slides in from the left edge; wait for the entrance to finish before measuring.
    await expect.poll(async () => (await sheet.boundingBox())?.x).toBe(0)
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

test.describe('Auth', () => {
  test('signs in, showing the server error first', async ({ page }) => {
    const preview = await example(page, 'sign-in-form/basic')
    await preview.getByRole('textbox', { name: 'Email' }).fill('ada@example.com')
    const password = preview.getByRole('textbox', { name: 'Password', exact: true })
    await password.fill('nope')
    await preview.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(preview.getByText('That email and password don’t match.')).toBeVisible()
    await password.fill('correct horse')
    await preview.getByRole('button', { name: 'Sign in', exact: true }).click()
    await expect(page.getByText('Signed in as Ada Lovelace')).toBeVisible()
  })

  test('the expired-session dialog signs the user back in', async ({ page }) => {
    const preview = await example(page, 'session-dialogs/expired')
    await preview.getByRole('button', { name: 'Sign in as Ada' }).click()
    await preview.getByRole('button', { name: 'Revoke session' }).click()
    await preview.getByRole('button', { name: 'Call the API' }).click()
    const dialog = page.getByRole('dialog', { name: 'Your session expired' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeVisible()
    await dialog.getByRole('textbox', { name: 'Password', exact: true }).fill('pw')
    await dialog.getByRole('button', { name: 'Sign in' }).click()
    await expect(dialog).toBeHidden()
  })

  test('role gates switch with the user', async ({ page }) => {
    const preview = await example(page, 'protected-routes/role-gate')
    await preview.getByRole('radio', { name: 'Admin' }).click()
    await expect(preview.getByText('Only admins see this card.')).toBeVisible()
    await preview.getByRole('radio', { name: 'Member' }).click()
    await expect(preview.getByText('You don’t have access to this page')).toBeVisible()
  })
})

test.describe('Viewers', () => {
  test('PdfViewer pages, zooms and highlights search matches', async ({ page }) => {
    const preview = await example(page, 'pdf-viewer/basic')
    await expect(preview.getByText('/ 6')).toBeVisible()
    const pageInput = preview.getByRole('textbox', { name: 'Page number' })
    await preview.getByRole('button', { name: 'Next page' }).click()
    await expect(pageInput).toHaveValue('2')
    await pageInput.fill('5')
    await pageInput.press('Enter')
    await expect(pageInput).toHaveValue('5')

    const zoom = preview.getByRole('combobox', { name: 'Zoom' })
    await preview.getByRole('button', { name: 'Zoom in' }).click()
    await expect(zoom).toContainText('%')

    await preview.getByRole('searchbox', { name: 'Search in document' }).fill('revenue')
    await expect(preview.getByText('1 of 4')).toBeVisible()
    await expect(preview.locator('mark[data-current]')).toHaveCount(1)
    await preview.getByRole('button', { name: 'Next match' }).click()
    await expect(preview.getByText('2 of 4')).toBeVisible()
  })

  test('CsvViewer opens 50,000 rows quickly and filters them', async ({ page }) => {
    const started = Date.now()
    const preview = await example(page, 'csv-viewer/large')
    await expect(preview.getByText(/50,000 rows · 5 columns/)).toBeVisible()
    expect(Date.now() - started).toBeLessThan(15_000)
    const table = preview.getByRole('table')
    await expect(table).toHaveAttribute('aria-rowcount', '50001')
    expect(await table.locator('tbody tr').count()).toBeLessThan(80)

    await preview.getByRole('searchbox', { name: 'Search rows' }).fill('Latin America')
    await expect(table).toHaveAttribute('aria-rowcount', '12501')

    await preview.getByRole('button', { name: 'amount', exact: true }).click()
    await expect(table.locator('th[aria-sort]')).toHaveAttribute('aria-sort', 'ascending')
  })

  test('SpreadsheetViewer switches sheets', async ({ page }) => {
    const preview = await example(page, 'spreadsheet-viewer/basic')
    await expect(preview.getByRole('table', { name: /sheet Q3 sales/ })).toBeVisible()
    await preview.getByRole('tab', { name: 'Targets' }).click()
    await expect(preview.getByRole('table', { name: /sheet Targets/ })).toBeVisible()
    await expect(preview.getByText(/4 rows · 3 columns/)).toBeVisible()
  })

  test('JsonViewer searches and expands', async ({ page }) => {
    const preview = await example(page, 'json-viewer/basic')
    const tree = preview.getByRole('tree')
    const before = await tree.getByRole('treeitem').count()
    await preview.getByRole('searchbox', { name: 'Search keys and values' }).fill('INV-104')
    await expect(preview.getByText(/1 of \d+/)).toBeVisible()
    await expect(tree.locator('mark').first()).toBeVisible()
    await preview.getByRole('button', { name: 'Expand all' }).click()
    expect(await tree.getByRole('treeitem').count()).toBeGreaterThan(before)
  })

  test('CodeViewer copies its code', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    const preview = await example(page, 'code-viewer/file')
    await preview.getByRole('button', { name: 'Copy code' }).click()
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('export async function remind')
    await expect(preview.locator('[data-line="15"]')).toHaveAttribute('data-mark', 'highlight')
  })

  test('DiffViewer switches between unified and split', async ({ page }) => {
    const preview = await example(page, 'diff-viewer/code')
    await expect(preview.getByRole('columnheader', { name: 'Code' })).toBeAttached()
    await preview.getByRole('radio', { name: 'Split' }).click()
    await expect(preview.getByRole('columnheader', { name: 'Before' })).toBeAttached()
    const expand = preview.getByRole('button', { name: /Show \d+ unchanged/ }).first()
    await expand.click()
    await expect(
      preview.getByText('export function isOverdue(invoice: Invoice) {').first(),
    ).toBeVisible()
  })

  test('ImageViewer zooms', async ({ page }) => {
    const preview = await example(page, 'image-viewer/basic')
    await preview.getByRole('button', { name: 'Actual size' }).click()
    await expect(preview.getByText('100%')).toBeVisible()
    await preview.getByRole('button', { name: 'Zoom in' }).click()
    await expect(preview.getByText('125%')).toBeVisible()
  })

  test('VideoPlayer plays, pauses and seeks', async ({ page }) => {
    const preview = await example(page, 'video-player/captions')
    const video = preview.locator('video')
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState))
      .toBeGreaterThan(0)
    await preview.getByRole('button', { name: 'Play Product tour' }).click()
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(0.2)
    await preview.getByRole('button', { name: 'Pause Product tour' }).click()
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true)
    await preview.getByRole('slider', { name: 'Position' }).press('End')
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime))
      .toBeGreaterThan(3.5)
  })

  test('AudioPlayer seeks from the waveform', async ({ page }) => {
    const preview = await example(page, 'audio-player/basic')
    const waveform = preview.getByRole('slider', { name: 'Position in Standup notes' })
    await expect(waveform.locator('rect').first()).toBeAttached()
    const audio = preview.locator('audio')
    await expect.poll(() => audio.evaluate((a: HTMLAudioElement) => a.duration)).toBeGreaterThan(5)
    const box = await waveform.boundingBox()
    if (!box) throw new Error('no waveform')
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height / 2)
    await expect
      .poll(() => audio.evaluate((a: HTMLAudioElement) => a.currentTime))
      .toBeGreaterThan(2.5)
  })

  test('FilePreview picks the right viewer', async ({ page }) => {
    const preview = await example(page, 'file-preview/switcher')
    const choose = async (name: string) => {
      await preview.getByRole('combobox', { name: 'Sample file' }).click()
      await page.getByRole('option', { name }).click()
    }
    await expect(preview.getByText('/ 6')).toBeVisible()
    await choose('customers.csv')
    await expect(preview.locator('[data-kind="csv"]').getByRole('table')).toBeVisible()
    await choose('workspace.json')
    await expect(preview.getByRole('tree')).toBeVisible()
    await choose('archive.zip')
    await expect(preview.getByText('No preview for this file')).toBeVisible()
  })
})

test.describe('Layout and focus details', () => {
  test('eight OTP slots fit a 390px screen', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 })
    const preview = await example(page, 'input-otp/grouped')
    const overflow = await preview.evaluate((el) => {
      const root = el.querySelector('[data-slot="input-otp"]')
      return root ? root.getBoundingClientRect().right - el.getBoundingClientRect().right : 0
    })
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('a tab panel that takes focus shows a ring', async ({ page }) => {
    const preview = await example(page, 'tabs/underline')
    const panel = preview.getByRole('tabpanel').first()
    await preview.getByRole('tab').first().focus()
    await page.keyboard.press('Tab')
    await expect(panel).toBeFocused()
    const ring = await panel.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(ring).not.toBe('none')
  })
})

test.describe('Theme studio', () => {
  const board = (page: import('@playwright/test').Page) => page.getByTestId('studio-board')
  const background = (locator: import('@playwright/test').Locator) =>
    locator.evaluate((el) => getComputedStyle(el).backgroundColor)

  test('editing the brand color restyles the preview and the exported file', async ({ page }) => {
    await open(page, '/themes/')
    const cta = board(page).getByRole('button', { name: 'New project' })
    const before = await background(cta)
    await page.getByRole('textbox', { name: /^primary/ }).fill('oklch(60% 0.22 25)')
    await expect.poll(() => background(cta)).not.toBe(before)
    await expect(page.getByTestId('theme-export')).toContainText("primary: 'oklch(60% 0.22 25)'")
    await expect(page.getByText('Edited', { exact: true })).toBeVisible()
  })

  test('switching the starting preset restyles the preview', async ({ page }) => {
    await open(page, '/themes/')
    const heading = board(page).getByRole('heading', { name: 'Good morning, Ada' })
    const glyphFont = await heading.evaluate((el) => getComputedStyle(el).fontFamily)
    await page.getByRole('radio', { name: 'Editorial' }).click()
    await expect
      .poll(() => heading.evaluate((el) => getComputedStyle(el).fontFamily))
      .not.toBe(glyphFont)
    await expect(page.getByTestId('theme-export')).toContainText('extends: presets.editorial')
  })

  test('flags an unreadable color and fixes it', async ({ page }) => {
    await open(page, '/themes/')
    const audit = page.getByTestId('contrast-audit')
    await expect(audit.getByText('All pass')).toBeVisible()
    await page.getByRole('textbox', { name: /^muted-foreground/ }).fill('oklch(88% 0.01 260)')
    const fix = audit.getByRole('button', { name: 'Fix muted-foreground in light mode' })
    await expect(fix).toBeVisible()
    await fix.click()
    await expect(fix).toBeHidden()
    await expect(audit.getByText('All pass')).toBeVisible()
  })

  test('keeps the theme in a shareable URL', async ({ page }) => {
    await open(page, '/themes/')
    await page.getByRole('textbox', { name: /^primary/ }).fill('oklch(62% 0.2 300)')
    await expect.poll(() => new URL(page.url()).searchParams.get('t')).toBeTruthy()
    const shared = new URL(page.url())
    await page.goto('about:blank')
    await open(page, shared.pathname + shared.search)
    await expect(page.getByRole('textbox', { name: /^primary/ })).toHaveValue('oklch(62% 0.2 300)')
  })
})

test.describe('Blocks gallery', () => {
  test('previews a block at phone and desktop widths', async ({ page }) => {
    await open(page, '/blocks/')
    await page.getByRole('heading', { level: 3, name: 'Pricing' }).scrollIntoViewIfNeeded()
    const frameEl = page.getByTestId('block-frame-pricing-three-tiers')
    await expect(frameEl).toBeVisible()
    const frame = page.frameLocator('[data-testid="block-frame-pricing-three-tiers"]')
    const starter = frame.getByRole('heading', { name: 'Starter' })
    const growth = frame.getByRole('heading', { name: 'Growth' })
    await expect(growth).toBeVisible()
    const gap = async () =>
      ((await growth.boundingBox())?.y ?? 0) - ((await starter.boundingBox())?.y ?? 0)
    // Desktop: tiers side by side (once their staggered entrance has played).
    await expect.poll(async () => Math.abs(await gap())).toBeLessThan(4)

    await page.getByRole('radio', { name: /Phone/ }).click()
    await expect.poll(async () => (await frameEl.boundingBox())?.width ?? 0).toBeLessThan(400)
    // Phone: the frame's own breakpoints stack the tiers.
    await expect.poll(gap).toBeGreaterThan(100)
  })
})

test.describe('Templates', () => {
  test('lists the apps with demos and source, and opens the file browser', async ({ page }) => {
    await open(page, '/templates/')
    const list = page.getByRole('list', { name: 'Templates' })
    await expect(list.getByRole('link', { name: /Live demo/ })).toHaveCount(2)
    await expect(list.getByRole('link', { name: 'Source' })).toHaveCount(3)
    await list.getByRole('link', { name: /Open/ }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'File browser' })).toBeVisible()
    await page
      .getByRole('navigation', { name: 'Files' })
      .getByRole('button', { name: /workspace\.json/ })
      .click()
    await expect(page.getByRole('tree')).toBeVisible()
  })
})
