import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'adapters/rest': 'src/adapters/rest.ts',
    'adapters/memory': 'src/adapters/memory.ts',
    'adapters/firebase': 'src/adapters/firebase.ts',
    'adapters/clerk': 'src/adapters/clerk.tsx',
    'react-router/index': 'src/react-router/index.tsx',
    'ui/index': 'src/ui/index.ts',
  },
  format: 'esm',
  platform: 'neutral',
  dts: true,
  clean: true,
  // One file per module, so apps only ship the adapters and screens they import.
  unbundle: true,
  // Components use hooks and context; mark every chunk as a client module for RSC frameworks.
  outputOptions: { banner: "'use client';" },
})
