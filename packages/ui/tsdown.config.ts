import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    form: 'src/patterns/form/index.ts',
    'data-table': 'src/patterns/data-table/index.ts',
  },
  format: 'esm',
  platform: 'neutral',
  dts: true,
  clean: true,
  // Components use hooks and context; mark every chunk as a client module for RSC frameworks.
  outputOptions: { banner: "'use client';" },
})
