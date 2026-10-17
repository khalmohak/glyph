import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: 'esm',
  platform: 'node',
  target: 'node20',
  // .js, not .mjs: the package is "type": "module", like the others.
  fixedExtension: false,
  unbundle: true,
  dts: true,
  clean: true,
})
