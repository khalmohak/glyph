/**
 * Exploratory QA sweep: every docs route in every preset, light and dark, desktop and phone.
 * Not part of CI (it loads every page ~16 times); run it with `pnpm -C apps/docs e2e:qa`.
 *
 * Findings are appended to `e2e/.results/qa-findings.jsonl` (delete it between runs) and fail
 * the test that found them,
 * except those listed in `knownIssues` below with a reason.
 */
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { routes } from './catalog'
import { expect, type Mode, open, type Preset, prepare, test } from './fixtures'

const presets: Preset[] = ['glyph', 'brutalist', 'editorial', 'playful']
const modes: Mode[] = ['light', 'dark']
const viewports = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
] as const

const report = join(dirname(fileURLToPath(import.meta.url)), '.results/qa-findings.jsonl')
mkdirSync(dirname(report), { recursive: true })

interface Finding {
  kind: string
  detail: string
}

/** Findings we accept, matched by kind and a substring of the detail, each with a reason. */
const knownIssues: { kind: string; detail: string; reason: string }[] = [
  {
    kind: 'request-failed',
    detail: 'example.invalid/missing.png',
    reason: 'The Avatar fallback example points at an image that cannot load, on purpose.',
  },
  {
    kind: 'console',
    detail: 'Failed to load resource: net::ERR_NAME_NOT_RESOLVED',
    reason: 'Same Avatar fallback example: the browser logs the failed image request.',
  },
  {
    kind: 'focus-invisible',
    detail: 'data-slot=command-input',
    reason: 'A full-width search field: the caret is the focus indicator, as in cmdk.',
  },
  {
    kind: 'focus-invisible',
    detail: 'data-slot=input-otp>',
    reason: 'The real input is invisible; the active slot shows focus with its own ring.',
  },
  {
    kind: 'focus-invisible',
    detail: 'data-slot=tabs-content',
    reason:
      'Reported to @glyphui/ui: TabsContent (Radix gives it tabIndex=0) has outline-none and no focus-visible ring. Remove once fixed.',
  },
  {
    kind: 'example-overflow',
    detail: 'input-otp/grouped <div data-slot=input-otp-group>',
    reason:
      'Reported to @glyphui/ui: two groups of three fixed-size slots are wider than a 390px preview, so it scrolls. Remove once slots shrink on phones.',
  },
]

const isKnown = (f: Finding) =>
  knownIssues.some((k) => k.kind === f.kind && f.detail.includes(k.detail))

/** Layout checks that run in page context. */
async function layoutFindings(page: Page): Promise<Finding[]> {
  return page.evaluate(() => {
    const out: { kind: string; detail: string }[] = []
    const describe = (el: Element) => {
      const ex = el.closest('[data-example]')?.getAttribute('data-example')
      const slot = el.getAttribute('data-slot')
      const label = (el.textContent ?? '').trim().slice(0, 40)
      return `${ex ? `${ex} ` : ''}<${el.tagName.toLowerCase()}${slot ? ` data-slot=${slot}` : ''}> "${label}"`
    }
    const scrollsX = (el: Element) => {
      const o = getComputedStyle(el).overflowX
      return o === 'auto' || o === 'scroll'
    }
    const hiddenX = (el: Element) => {
      const o = getComputedStyle(el).overflowX
      return o === 'hidden' || o === 'clip'
    }
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.opacity !== '0'
    }

    const overflow = document.documentElement.scrollWidth - innerWidth
    if (overflow > 1) out.push({ kind: 'page-overflow', detail: `${overflow}px` })

    // Elements that stick out of their example preview without a scroll container between.
    for (const preview of document.querySelectorAll('[data-example]')) {
      const box = preview.getBoundingClientRect()
      for (const el of preview.querySelectorAll('*')) {
        if (!visible(el)) continue
        const r = el.getBoundingClientRect()
        if (r.right <= box.right + 1 && r.left >= box.left - 1) continue
        let clipped = false
        for (let p = el.parentElement; p && p !== preview; p = p.parentElement) {
          if (scrollsX(p) || hiddenX(p)) {
            clipped = true
            break
          }
        }
        if (clipped || getComputedStyle(el).position === 'fixed') continue
        out.push({ kind: 'example-overflow', detail: describe(el) })
        break
      }
    }

    // Text cut off without an ellipsis: overflow hidden, wider content, text inside.
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el) || !hiddenX(el)) continue
      // Screen-reader-only text is a 1px box with hidden overflow on purpose.
      const r = el.getBoundingClientRect()
      if (r.width <= 2 || r.height <= 2) continue
      const s = getComputedStyle(el)
      if (s.textOverflow === 'ellipsis' || el.scrollWidth <= el.clientWidth + 1) continue
      if (el.closest('[data-slot="scroll-area"], svg, canvas, [aria-hidden="true"]')) continue
      const hasText = [...el.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim(),
      )
      if (hasText) out.push({ kind: 'text-clipped', detail: describe(el) })
    }

    for (const img of document.querySelectorAll('img')) {
      if (!visible(img) && img.getBoundingClientRect().width === 0 && img.complete) {
        out.push({ kind: 'image-empty', detail: img.getAttribute('src') ?? '' })
      } else if (img.complete && img.naturalWidth === 0) {
        out.push({ kind: 'image-broken', detail: img.getAttribute('src') ?? '' })
      }
    }
    return out
  })
}

/** Tabs through the first focusable elements and reports ones with no visible focus style. */
async function focusFindings(page: Page): Promise<Finding[]> {
  const out: Finding[] = []
  // Start inside <main> so the sidebar and top bar don't use up the Tab presses.
  await page.evaluate(() => {
    const main = document.querySelector('main')
    main?.setAttribute('tabindex', '-1')
    main?.focus()
  })
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    const result = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body || !el.closest('main')) return null
      // Focus is visible when something about the element (or the parent drawing a
      // :focus-within ring) looks different from the unfocused state.
      const look = (node: Element | null) => {
        if (!node) return ''
        const s = getComputedStyle(node)
        const outline = s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0
        return [
          outline ? `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` : '',
          s.boxShadow,
          s.borderColor,
          s.backgroundColor,
          s.textDecorationLine,
          s.stroke,
          s.strokeWidth,
        ].join('|')
      }
      // Inputs inside groups (PasswordInput, adornments) ring a wrapper up to two levels up.
      // Some items ring a child instead (TreeView rings its row).
      const all = () =>
        look(el) +
        look(el.parentElement) +
        look(el.parentElement?.parentElement ?? null) +
        look(el.firstElementChild)
      const focused = all()
      el.blur()
      const unfocused = all()
      ;(el as HTMLElement & { focus(o?: { focusVisible?: boolean }): void }).focus({
        focusVisible: true,
      })
      if (focused !== unfocused) return null
      const ex = el.closest('[data-example]')?.getAttribute('data-example') ?? ''
      const slot = el.getAttribute('data-slot')
      const role = el.getAttribute('role')
      const label = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)
      return `${ex} <${el.tagName.toLowerCase()}${slot ? ` data-slot=${slot}` : ''}${role ? ` role=${role}` : ''}> "${label}"`
    })
    if (result) out.push({ kind: 'focus-invisible', detail: result })
  }
  return out
}

/** Clicks every control in every example once, pressing Escape after each, to catch crashes. */
async function clickFindings(page: Page, errors: string[]): Promise<Finding[]> {
  const out: Finding[] = []
  const previews = page.locator('[data-example]')
  const count = await previews.count()
  for (let i = 0; i < count; i++) {
    const preview = previews.nth(i)
    const id = (await preview.getAttribute('data-example')) ?? ''
    const controls = preview.locator(
      'button:not([disabled]), [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], a[href^="#"]',
    )
    const n = Math.min(await controls.count(), 20)
    for (let j = 0; j < n; j++) {
      const before = errors.length
      const control = controls.nth(j)
      // Controls can disappear after an earlier click (closed panels, removed items).
      if (!(await control.isVisible().catch(() => false))) continue
      await control.click({ timeout: 2000, trial: false }).catch(() => {})
      await page.keyboard.press('Escape').catch(() => {})
      if (errors.length > before) {
        out.push({ kind: 'click-error', detail: `${id} control ${j}: ${errors.at(-1)}` })
      }
      // Clicking can navigate (e.g. a link inside an example): come back to this page.
      if (!page.url().includes('/components/')) break
    }
  }
  return out
}

for (const preset of presets) {
  for (const mode of modes) {
    for (const viewport of viewports) {
      const combo = `${preset}-${mode}-${viewport.name}`
      // Expensive checks run in a few combos; layout checks run everywhere.
      const deep = preset === 'glyph' && (viewport.name === 'desktop' || mode === 'light')

      test.describe(combo, () => {
        test.use({ viewport: { width: viewport.width, height: viewport.height } })

        for (const route of routes) {
          test(route, async ({ page }) => {
            test.setTimeout(deep ? 180_000 : 60_000)
            const errors: string[] = []
            const findings: Finding[] = []
            page.on('console', (m) => {
              if (m.type() === 'error' || m.type() === 'warning') {
                errors.push(`[${m.type()}] ${m.text().slice(0, 300)}`)
              }
            })
            page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
            page.on('requestfailed', (r) => {
              const failure = r.failure()?.errorText ?? ''
              if (!failure.includes('ERR_ABORTED')) {
                findings.push({ kind: 'request-failed', detail: `${r.url()} ${failure}` })
              }
            })
            page.on('response', (r) => {
              if (r.status() >= 400) {
                findings.push({ kind: 'http-error', detail: `${r.status()} ${r.url()}` })
              }
            })

            await prepare(page, { mode, theme: preset })
            await open(page, route)
            for (const error of errors) findings.push({ kind: 'console', detail: error })
            findings.push(...(await layoutFindings(page)))
            if (deep && route.startsWith('/components/') && route !== '/components/') {
              findings.push(...(await focusFindings(page)))
              const loadErrors = errors.length
              findings.push(...(await clickFindings(page, errors)))
              for (const error of errors.slice(loadErrors)) {
                if (!findings.some((f) => f.detail.includes(error))) {
                  findings.push({ kind: 'console-after-click', detail: error })
                }
              }
            }

            const unique = [...new Map(findings.map((f) => [`${f.kind}|${f.detail}`, f])).values()]
            for (const f of unique) {
              appendFileSync(report, `${JSON.stringify({ combo, route, ...f })}\n`)
            }
            expect.soft(unique.filter((f) => !isKnown(f))).toEqual([])
          })
        }
      })
    }
  }
}
