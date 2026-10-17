import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    form: 'src/patterns/form/index.ts',
    'data-table': 'src/patterns/data-table/index.ts',
    'data-table-virtual': 'src/patterns/data-table/virtual.ts',
    chart: 'src/patterns/chart/index.ts',
    'react-router': 'src/integrations/react-router.tsx',
    vite: 'src/integrations/vite.ts',
  },
  format: 'esm',
  // One output file per source module, so bundlers drop everything an app doesn't import
  // (with `sideEffects` in package.json). A single bundled file kept every dependency alive.
  unbundle: true,
  platform: 'neutral',
  dts: true,
  clean: true,
  // Components use hooks and context; mark every chunk as a client module for RSC frameworks.
  outputOptions: { banner: "'use client';" },
})
