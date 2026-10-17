import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    pdf: 'src/pdf/index.ts',
    csv: 'src/csv/index.ts',
    spreadsheet: 'src/spreadsheet/index.ts',
    json: 'src/json/index.ts',
    code: 'src/code/index.ts',
    markdown: 'src/markdown/index.ts',
    diff: 'src/diff/index.ts',
    media: 'src/media/index.ts',
  },
  format: 'esm',
  // One file per module: importing one viewer never pulls another viewer's dependencies.
  unbundle: true,
  platform: 'neutral',
  dts: true,
  clean: true,
  outputOptions: { banner: "'use client';" },
})
