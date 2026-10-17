import * as auth from '@glyphui/auth'
import * as authClerk from '@glyphui/auth/clerk'
import * as authFirebase from '@glyphui/auth/firebase'
import * as authMemory from '@glyphui/auth/memory'
import * as authRouter from '@glyphui/auth/react-router'
import * as authRest from '@glyphui/auth/rest'
import * as authUi from '@glyphui/auth/ui'
import * as blocks from '@glyphui/blocks'
import * as ui from '@glyphui/ui'
import * as chart from '@glyphui/ui/chart'
import * as dataTable from '@glyphui/ui/data-table'
import * as dataTableVirtual from '@glyphui/ui/data-table/virtual'
import * as form from '@glyphui/ui/form'
import * as reactRouter from '@glyphui/ui/react-router'
import * as vite from '@glyphui/ui/vite'
import * as viewers from '@glyphui/viewers'
import * as viewersCode from '@glyphui/viewers/code'
import * as viewersCsv from '@glyphui/viewers/csv'
import * as viewersDiff from '@glyphui/viewers/diff'
import * as viewersJson from '@glyphui/viewers/json'
import * as viewersMarkdown from '@glyphui/viewers/markdown'
import * as viewersMedia from '@glyphui/viewers/media'
import * as viewersPdf from '@glyphui/viewers/pdf'
import * as viewersSpreadsheet from '@glyphui/viewers/spreadsheet'
import { describe, expect, it } from 'vitest'
import { catalog, docs } from './lib/catalog'

const entries = {
  '@glyphui/ui': ui,
  '@glyphui/ui/form': form,
  '@glyphui/ui/data-table': dataTable,
  '@glyphui/ui/data-table/virtual': dataTableVirtual,
  '@glyphui/ui/chart': chart,
  '@glyphui/ui/react-router': reactRouter,
  '@glyphui/ui/vite': vite,
  '@glyphui/blocks': blocks,
  '@glyphui/auth': auth,
  '@glyphui/auth/rest': authRest,
  '@glyphui/auth/memory': authMemory,
  '@glyphui/auth/firebase': authFirebase,
  '@glyphui/auth/clerk': authClerk,
  '@glyphui/auth/react-router': authRouter,
  '@glyphui/auth/ui': authUi,
  '@glyphui/viewers': viewers,
  '@glyphui/viewers/pdf': viewersPdf,
  '@glyphui/viewers/csv': viewersCsv,
  '@glyphui/viewers/spreadsheet': viewersSpreadsheet,
  '@glyphui/viewers/json': viewersJson,
  '@glyphui/viewers/code': viewersCode,
  '@glyphui/viewers/markdown': viewersMarkdown,
  '@glyphui/viewers/diff': viewersDiff,
  '@glyphui/viewers/media': viewersMedia,
} as const

const exampleFiles = Object.keys(import.meta.glob('./content/*/examples/*.tsx')).map((path) =>
  path.replace('./content/', '').replace('/examples/', '/').replace('.tsx', ''),
)

const snippetFiles = Object.keys(import.meta.glob('./content/*/snippets/*.{ts,tsx}')).map((path) =>
  path
    .replace('./content/', '')
    .replace('/snippets/', '/')
    .replace(/\.tsx?$/, ''),
)

describe('component catalog', () => {
  it('has a file for every listed snippet, and lists every snippet file', () => {
    const listed = docs.flatMap((doc) => (doc.snippets ?? []).map((e) => `${doc.slug}/${e.file}`))
    expect(listed.filter((key) => !snippetFiles.includes(key))).toEqual([])
    expect(snippetFiles.filter((key) => !listed.includes(key))).toEqual([])
  })

  it('documents every runtime export of every entry point', () => {
    const documented = new Set(docs.flatMap((doc) => doc.exports ?? []))
    const missing = Object.entries(entries).flatMap(([entry, mod]) =>
      Object.keys(mod)
        .filter((name) => !documented.has(name))
        .map((name) => `${entry}: ${name}`),
    )
    expect(missing, 'Add these to a docs meta.ts `exports` list').toEqual([])
  })

  it('lists only exports that exist', () => {
    const stale = docs.flatMap((doc) => {
      const mod = entries[doc.entry ?? '@glyphui/ui'] as Record<string, unknown>
      return (doc.exports ?? [])
        .filter((name) => !(name in mod))
        .map((name) => `${doc.slug}: ${name}`)
    })
    expect(stale).toEqual([])
  })

  it('has an example file for every listed example, and lists every example file', () => {
    const listed = docs.flatMap((doc) => (doc.examples ?? []).map((e) => `${doc.slug}/${e.file}`))
    expect(listed.filter((key) => !exampleFiles.includes(key))).toEqual([])
    expect(exampleFiles.filter((key) => !listed.includes(key))).toEqual([])
  })

  it('uses unique slugs that match their folders', () => {
    const slugs = catalog.map((doc) => doc.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
