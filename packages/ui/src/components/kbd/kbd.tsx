import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'

export const kbdStyles = /* @__PURE__ */ tv({
  slots: {
    base: 'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-border bg-muted px-1 font-mono text-[0.6875rem] font-medium text-muted-foreground shadow-xs',
  },
})

/** A keyboard key, e.g. `<Kbd>⌘K</Kbd>`. */
export function Kbd(inProps: ComponentProps<'kbd'>) {
  const [{ className, ...rest }, slots] = useComponentConfig('Kbd', inProps)
  return (
    <kbd
      data-slot="kbd"
      className={kbdStyles().base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}
