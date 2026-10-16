import { Slot } from 'radix-ui'
import { type ComponentProps, Fragment, type ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { Spinner } from '../spinner'
import { type ButtonVariants, buttonStyles } from './button.styles'

export interface ButtonProps extends ComponentProps<'button'>, ButtonVariants {
  /** Render the child element (e.g. a router link) with button styles instead of a `<button>`. */
  asChild?: boolean
  /** Shows a spinner, disables the button and sets `aria-busy`. */
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button(inProps: ButtonProps) {
  const [props, slots] = useComponentConfig('Button', inProps)
  const {
    variant,
    size,
    iconOnly,
    fullWidth,
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    disabled,
    type,
    className,
    children,
    ...rest
  } = props
  const s = buttonStyles({ variant, size, iconOnly, fullWidth })
  const Comp = asChild ? Slot.Root : 'button'
  const icon = (node: ReactNode) =>
    node ? (
      <span data-slot="button-icon" className={s.icon({ class: slots.icon })} aria-hidden="true">
        {node}
      </span>
    ) : null

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'primary'}
      className={s.base({ class: [slots.base, className] })}
      aria-busy={loading || undefined}
      {...(!asChild && { type: type ?? 'button', disabled: disabled || loading })}
      {...rest}
    >
      {iconOnly && asChild
        ? // The child element (e.g. a link) holds its own icon; Slot merges button props onto it.
          children
        : iconOnly
          ? icon(loading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : children)
          : // Children stay direct (no Fragment) so Slot can find the Slottable when asChild is set.
            [
              <Fragment key="start">{icon(loading ? <Spinner size="sm" /> : leftIcon)}</Fragment>,
              <Slot.Slottable key="content">{children}</Slot.Slottable>,
              <Fragment key="end">{icon(rightIcon)}</Fragment>,
            ]}
    </Comp>
  )
}

export interface IconButtonProps
  extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'iconOnly' | 'fullWidth' | 'children'> {
  icon: ReactNode
  /** Required: an icon-only button has no visible text. */
  'aria-label': string
}

/** A square button holding one icon. Shares Button's variants and theme overrides. */
export function IconButton({ icon, variant = 'ghost', ...props }: IconButtonProps) {
  return (
    <Button variant={variant} {...props} iconOnly>
      {icon}
    </Button>
  )
}
