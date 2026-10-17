import { GlyphProvider } from '@glyphui/ui'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import theme from './glyph.theme'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlyphProvider theme={theme} defaultMode="system" toaster>
      <App />
    </GlyphProvider>
  </StrictMode>,
)
