import { type ColorMode, scopeSelector, type Theme } from '@glyphkit/tokens'
import { Slot } from 'radix-ui'
import { type ComponentProps, useContext, useMemo } from 'react'
import { cn } from '../utils/cn'
import { GlyphContext } from './glyph-context'
import { ThemeStyle } from './theme-style'

export interface ThemeScopeProps extends ComponentProps<'div'> {
  theme: Theme
  /** Force a color mode for this subtree. Follows the page by default. */
  mode?: ColorMode
  asChild?: boolean
}

/** Renders a subtree with a different theme, e.g. to compare themes side by side. */
export function ThemeScope({ theme, mode, asChild, children, ...props }: ThemeScopeProps) {
  const parent = useContext(GlyphContext)
  const value = useMemo(
    () => ({ theme, linkComponent: parent?.linkComponent ?? 'a' }),
    [theme, parent?.linkComponent],
  )
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <GlyphContext.Provider value={value}>
      <ThemeStyle theme={theme} selector={scopeSelector(theme)} />
      <Comp
        data-glyph-theme={theme.name}
        data-mode={mode}
        {...props}
        className={cn('bg-background font-sans text-foreground', props.className)}
      >
        {children}
      </Comp>
    </GlyphContext.Provider>
  )
}
