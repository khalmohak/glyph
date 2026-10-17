import type { ComponentProps, ReactNode } from 'react'
import { Button } from '../../components/button'
import { Spinner } from '../../components/spinner'
import { useComponentConfig } from '../../hooks/use-component-config'
import { AlertIcon, InboxIcon } from '../../internal/icons'
import { tv } from '../../utils/tv'

export const stateStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
    icon: 'flex size-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground shadow-xs [&>svg]:size-5',
    text: 'grid max-w-sm gap-1',
    title: 'text-body font-medium text-foreground',
    description: 'text-small text-muted-foreground',
    action: 'mt-1 flex items-center gap-2',
  },
  variants: {
    tone: {
      neutral: {},
      danger: { icon: 'border-danger/30 bg-danger/10 text-danger' },
    },
  },
})

export interface StateProps extends Omit<ComponentProps<'div'>, 'title'> {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}

/** Shown when a list or page has no content yet. Say what will appear and how to add it. */
export function EmptyState(inProps: StateProps) {
  const [props, slots] = useComponentConfig('EmptyState', inProps)
  const { icon = <InboxIcon />, title, description, action, className, ...rest } = props
  const s = stateStyles({ tone: 'neutral' })
  return (
    <div data-slot="empty-state" className={s.root({ class: [slots.root, className] })} {...rest}>
      <div className={s.icon({ class: slots.icon })} aria-hidden="true">
        {icon}
      </div>
      <div className={s.text({ class: slots.text })}>
        <p className={s.title({ class: slots.title })}>{title}</p>
        {description && (
          <p className={s.description({ class: slots.description })}>{description}</p>
        )}
      </div>
      {action && <div className={s.action({ class: slots.action })}>{action}</div>}
    </div>
  )
}

export interface ErrorStateProps extends Omit<StateProps, 'title'> {
  title?: ReactNode
  /** The caught error. Its message is shown when no `description` is given. */
  error?: unknown
  /** Shows a "Try again" button. */
  onRetry?: (() => unknown) | undefined
}

function messageOf(error: unknown): string | undefined {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return undefined
}

/** Shown when loading failed. Explains what went wrong and offers a retry. */
export function ErrorState(inProps: ErrorStateProps) {
  const [props, slots] = useComponentConfig('EmptyState', inProps)
  const {
    icon = <AlertIcon />,
    title = 'Couldn’t load this',
    description,
    error,
    onRetry,
    action,
    className,
    ...rest
  } = props
  const s = stateStyles({ tone: 'danger' })
  const detail = description ?? messageOf(error)
  return (
    <div
      data-slot="error-state"
      role="alert"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <div className={s.icon({ class: slots.icon })} aria-hidden="true">
        {icon}
      </div>
      <div className={s.text({ class: slots.text })}>
        <p className={s.title({ class: slots.title })}>{title}</p>
        {detail && <p className={s.description({ class: slots.description })}>{detail}</p>}
      </div>
      {(action || onRetry) && (
        <div className={s.action({ class: slots.action })}>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={() => onRetry()}>
              Try again
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  )
}

export interface LoadingStateProps extends ComponentProps<'div'> {
  label?: string
}

/** A centered spinner with a label, for content that has no natural skeleton. */
export function LoadingState({ label = 'Loading…', className, ...props }: LoadingStateProps) {
  const s = stateStyles()
  return (
    <div
      data-slot="loading-state"
      role="status"
      className={s.root({ class: className })}
      {...props}
    >
      <Spinner size="lg" className="text-faint-foreground" />
      <p className={s.description()}>{label}</p>
    </div>
  )
}
