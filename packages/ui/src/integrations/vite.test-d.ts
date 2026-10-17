// Type-level contract: the plugin plugs into Vite without casts. Checked by `tsc`.
import type { Plugin } from 'vite'
import { glyphColorMode } from './vite'

const plugin: Plugin = glyphColorMode({ defaultMode: 'dark' })
void plugin
