// Renders public/og.png, the 1200×630 card that link previews show for every docs page.
// Run after changing the copy: `node scripts/og-image.mjs` (needs Playwright's Chromium).
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))
const font = (pkg, file) =>
  readFileSync(join(dirname(require.resolve(`${pkg}/package.json`)), 'files', file)).toString(
    'base64',
  )
const sans = font('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2')
const mono = font('@fontsource-variable/geist-mono', 'geist-mono-latin-wght-normal.woff2')

const html = `<!doctype html>
<style>
  @font-face { font-family: Geist; src: url(data:font/woff2;base64,${sans}) format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'Geist Mono'; src: url(data:font/woff2;base64,${mono}) format('woff2'); font-weight: 100 900; }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; padding: 72px 80px; overflow: hidden;
    display: flex; flex-direction: column; justify-content: space-between;
    font-family: Geist; color: #fafafa;
    background:
      radial-gradient(700px 420px at 92% 0%, rgb(59 130 246 / 0.28), transparent 70%),
      linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px) 0 0 / 48px 48px,
      linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px) 0 0 / 48px 48px,
      #0a0a0a;
  }
  .brand { display: flex; align-items: center; gap: 16px; font-size: 40px; font-weight: 600; letter-spacing: -0.02em; }
  .brand svg { width: 44px; height: 44px; }
  h1 { font-size: 58px; line-height: 1.1; white-space: nowrap; font-weight: 600; letter-spacing: -0.035em; }
  h1 span { color: #60a5fa; }
  p { margin-top: 24px; font-size: 30px; line-height: 1.4; color: #a1a1aa; max-width: 900px; }
  footer { display: flex; align-items: center; justify-content: space-between; font-size: 26px; color: #a1a1aa; }
  code {
    font-family: 'Geist Mono'; font-size: 24px; color: #fafafa;
    padding: 14px 22px; border-radius: 12px;
    border: 1px solid rgb(255 255 255 / 0.12); background: rgb(255 255 255 / 0.05);
  }
</style>
<div class="brand">
  <svg viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12Z" fill="#fafafa"/><path d="M12 7.5 16.5 12 12 16.5 7.5 12Z" fill="#0a0a0a"/></svg>
  glyph
</div>
<div>
  <h1>React components for Tailwind CSS v4,<br><span>themed by one file.</span></h1>
  <p>Color, type, shape, depth and motion from a single typed theme. Forms, data tables, auth and file viewers included.</p>
</div>
<footer><span>glyphui.xyz</span><code>npm install @glyphui/ui</code></footer>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.setContent(html)
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(root, 'public/og.png') })
await browser.close()
console.log('wrote public/og.png')
