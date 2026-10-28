import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Plugin, ResolvedConfig } from 'vite'
import {
  componentTitle,
  guides,
  HOME_TITLE,
  LIVE_URL,
  REPO_URL,
  SITE_NAME,
  sections,
  staticRoutes,
} from '../src/lib/site'

/**
 * Static hosts return 404 for client-side routes, so the build writes an index.html for every
 * route: its own title, description, canonical URL, Open Graph card and JSON-LD, plus the page
 * as static HTML inside #root. Crawlers that don't run JavaScript (Bing, AI search) index that
 * HTML; browsers hide it and React replaces it on mount. Also writes sitemap.xml and robots.txt.
 *
 * Runs after glyph-docs-content has written the Markdown exports, which become the static HTML
 * of component, guide and changelog pages.
 */

interface RouteMeta {
  path: string
  title: string
  description?: string
  /** A roadmap entry with no docs yet: kept out of search results and the sitemap. */
  planned?: boolean
}

const SITE_DESCRIPTION =
  'React components on Tailwind CSS v4 that take their whole look from one typed theme file.'
/** public/og.png, made by scripts/og-image.mjs. */
const OG_IMAGE = { path: 'og.png', width: 1200, height: 630 }

/** Reads name, description and status from meta.ts and roadmap.ts without executing them. */
function routeMetas(contentRoot: string): RouteMeta[] {
  const field = (src: string, key: string) =>
    src.match(new RegExp(`${key}:\\s*(?:\\n\\s*)?(['"\`])((?:\\\\.|(?!\\1).)*)\\1`))?.[2]
  // Static sections and guides come from the site map; component pages from content/.
  const routes: RouteMeta[] = staticRoutes.map(({ path, title, description }) => ({
    path,
    title,
    description,
  }))
  for (const dir of readdirSync(contentRoot, { withFileTypes: true })) {
    const meta = join(contentRoot, dir.name, 'meta.ts')
    if (!dir.isDirectory() || !existsSync(meta)) continue
    const src = readFileSync(meta, 'utf8')
    const description = field(src, 'description')
    const planned = field(src, 'status') === 'planned'
    routes.push({
      path: `components/${dir.name}`,
      title: componentTitle(field(src, 'name') ?? dir.name, planned),
      ...(description && { description }),
      ...(planned && { planned }),
    })
  }
  const roadmap = readFileSync(join(contentRoot, 'roadmap.ts'), 'utf8')
  for (const entry of roadmap.matchAll(/\{[^{}]*?slug: '([^']+)'[^{}]*?\}/g)) {
    const name = field(entry[0], 'name') ?? entry[1] ?? ''
    const description = field(entry[0], 'description')
    if (!routes.some((r) => r.path === `components/${entry[1]}`)) {
      routes.push({
        path: `components/${entry[1]}`,
        title: componentTitle(name, true),
        ...(description && { description }),
        planned: true,
      })
    }
  }
  return routes
}

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const urlOf = (path: string) => `${LIVE_URL}/${path ? `${path}/` : ''}`
/** "Button · React + Tailwind CSS · Glyph" → "Button". */
const shortTitle = (title: string) => title.split(' · ')[0] ?? title

/** schema.org data: the project on the home page, a breadcrumb trail everywhere else. */
function structuredData(route: RouteMeta): object {
  if (!route.path) {
    return [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: urlOf('') },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: urlOf(''),
        codeRepository: REPO_URL,
        programmingLanguage: ['TypeScript', 'React'],
        runtimePlatform: 'Web browser',
        license: 'https://opensource.org/licenses/MIT',
      },
    ]
  }
  const crumbs = [{ name: SITE_NAME, path: '' }]
  const section = sections.find((s) => route.path.startsWith(`${s.href.slice(1)}/`))
  if (section) crumbs.push({ name: section.label, path: section.href.slice(1) })
  crumbs.push({ name: shortTitle(route.title), path: route.path })
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: urlOf(crumb.path),
    })),
  }
}

const link = (path: string, label: string) =>
  `<li><a href="${escapeAttr(urlOf(path))}">${escapeText(label)}</a></li>`

/** The page as plain HTML: its Markdown export where there is one, else title and summary. */
function staticBody(route: RouteMeta, markdown: string | null, components: RouteMeta[]): string {
  const main = markdown
    ? renderToStaticMarkup(createElement(Markdown, { remarkPlugins: [remarkGfm] }, markdown))
    : `<h1>${escapeText(route.path ? shortTitle(route.title) : HOME_TITLE)}</h1><p>${escapeText(route.description ?? SITE_DESCRIPTION)}</p>`
  // Home and the gallery link every component, so each page is a click from the top.
  const index =
    route.path === '' || route.path === 'components'
      ? `<h2>Components</h2><ul>${components.map((c) => link(c.path, shortTitle(c.title))).join('')}</ul>`
      : ''
  const nav = [
    `<nav aria-label="Site"><ul>${link('', SITE_NAME)}${sections.map((s) => link(s.href.slice(1), s.label)).join('')}</ul></nav>`,
    `<nav aria-label="Guides"><ul>${guides.map((g) => link(`docs/${g.slug}`, g.title)).join('')}</ul></nav>`,
  ].join('')
  return `<div id="prerender">${nav}<main>${main}${index}</main></div>`
}

export function prerender(): Plugin {
  const contentRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../src/content')
  let config: ResolvedConfig | undefined

  return {
    name: 'glyph-docs-prerender',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    closeBundle: {
      // Wait for the other plugins' closeBundle: the Markdown files must exist first.
      order: 'post',
      sequential: true,
      handler() {
        if (!config) return
        const outDir = resolve(config.root, config.build.outDir)
        const shell = readFileSync(join(outDir, 'index.html'), 'utf8')
        const routes = routeMetas(contentRoot)
        const components = routes.filter((r) => r.path.startsWith('components/') && !r.planned)
        const ogImage = `${LIVE_URL}/${OG_IMAGE.path}`

        const page = (route: RouteMeta, noindex = false) => {
          const title = escapeAttr(route.title)
          const description = escapeAttr(route.description ?? SITE_DESCRIPTION)
          const url = escapeAttr(urlOf(route.path))
          const mdPath = `${route.path}.md`
          const markdown =
            route.path && existsSync(join(outDir, mdPath))
              ? readFileSync(join(outDir, mdPath), 'utf8')
              : null
          const jsonLd = JSON.stringify(structuredData(route)).replace(/</g, '\\u003c')
          // Canonical and Open Graph URLs come from SITE_URL, so moving domains is one setting.
          const head = [
            `<link rel="canonical" href="${url}" />`,
            ...(markdown
              ? [
                  `<link rel="alternate" type="text/markdown" href="${escapeAttr(`${LIVE_URL}/${mdPath}`)}" />`,
                ]
              : []),
            `<meta property="og:type" content="website" />`,
            `<meta property="og:site_name" content="${SITE_NAME}" />`,
            `<meta property="og:title" content="${title}" />`,
            `<meta property="og:description" content="${description}" />`,
            `<meta property="og:url" content="${url}" />`,
            `<meta property="og:image" content="${ogImage}" />`,
            `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
            `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
            `<meta name="twitter:card" content="summary_large_image" />`,
            `<meta name="twitter:image" content="${ogImage}" />`,
            ...(noindex || route.planned ? ['<meta name="robots" content="noindex" />'] : []),
            `<script type="application/ld+json">${jsonLd}</script>`,
          ].join('\n    ')
          return shell
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(
              /<meta name="description" content="[^"]*"/,
              `<meta name="description" content="${description}"`,
            )
            .replace('</head>', `    ${head}\n  </head>`)
            .replace(
              '<div id="root"></div>',
              `<div id="root">${noindex ? '' : staticBody(route, markdown, components)}</div>`,
            )
        }

        for (const route of routes) {
          mkdirSync(join(outDir, route.path), { recursive: true })
          writeFileSync(join(outDir, route.path, 'index.html'), page(route))
        }
        // The blocks gallery's iframes load this one page with ?slug=&file=; keep it out of search.
        mkdirSync(join(outDir, 'blocks/frame'), { recursive: true })
        writeFileSync(
          join(outDir, 'blocks/frame/index.html'),
          page({ path: 'blocks/frame', title: `Block preview · ${SITE_NAME}` }, true),
        )
        writeFileSync(join(outDir, 'index.html'), page({ path: '', title: HOME_TITLE }))
        writeFileSync(
          join(outDir, 'sitemap.xml'),
          [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            `  <url><loc>${escapeAttr(urlOf(''))}</loc></url>`,
            ...routes
              .filter((route) => !route.planned)
              .map((route) => `  <url><loc>${escapeAttr(urlOf(route.path))}</loc></url>`),
            '</urlset>',
            '',
          ].join('\n'),
        )
        writeFileSync(
          join(outDir, 'robots.txt'),
          `User-agent: *\nDisallow: ${new URL(urlOf('blocks/frame')).pathname}\n\nSitemap: ${urlOf('')}sitemap.xml\n`,
        )
      },
    },
  }
}
