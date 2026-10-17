import { GlyphProvider } from '@glyphui/ui'
import { reactRouter } from '@glyphui/ui/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import theme from './glyph.theme'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <GlyphProvider theme={theme} defaultMode="system" router={reactRouter} toaster>
        <App />
      </GlyphProvider>
    </BrowserRouter>
  </StrictMode>,
)
