import { type Theme, themeToCss } from '@glyphui/tokens'
import { useMemo } from 'react'

interface ThemeStyleProps {
  theme: Theme
  selector?: string
}

/** Renders a theme's CSS variables. Re-renders replace the previous rules in place. */
export function ThemeStyle({ theme, selector }: ThemeStyleProps) {
  const css = useMemo(() => themeToCss(theme, selector ? { selector } : {}), [theme, selector])
  return (
    <style
      data-glyph-theme-style={theme.name}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: generated from typed theme tokens
      dangerouslySetInnerHTML={{ __html: css }}
    />
  )
}
