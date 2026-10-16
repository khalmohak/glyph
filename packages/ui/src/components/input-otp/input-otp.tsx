import { OTPInput, OTPInputContext, type OTPInputProps } from 'input-otp'
import { type ComponentProps, createContext, type ReactNode, useContext } from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { useFieldControl } from '../field/field-context'
import { type InputOTPVariants, inputOtpStyles } from './input-otp.styles'

type Styles = ReturnType<typeof inputOtpStyles>
const PartsContext = createContext<{
  s: Styles
  slots: SlotClasses<'InputOTP'>
  invalid: boolean
} | null>(null)

function useParts() {
  return useContext(PartsContext) ?? { s: inputOtpStyles(), slots: {}, invalid: false }
}

export type InputOTPProps = Omit<OTPInputProps, 'render' | 'children' | 'maxLength'> &
  InputOTPVariants & {
    /** Number of characters. Default 6. */
    length?: number
    /** Custom slot layout (InputOTPGroup, InputOTPSlot, InputOTPSeparator). Defaults to one group of `length` slots. */
    children?: ReactNode
  }

/**
 * One-time code input: one box per character, paste support, and autofill from SMS on
 * mobile. Built on input-otp. Restrict characters with `pattern`, e.g. `REGEXP_ONLY_DIGITS`.
 */
export function InputOTP(inProps: InputOTPProps) {
  const [props, slots] = useComponentConfig('InputOTP', useFieldControl(inProps))
  const { length = 6, size, children, className, containerClassName, ...rest } = props
  const s = inputOtpStyles({ size })
  const invalid = rest['aria-invalid'] === true || rest['aria-invalid'] === 'true'
  return (
    <PartsContext.Provider value={{ s, slots, invalid }}>
      <OTPInput
        data-slot="input-otp"
        maxLength={length}
        autoComplete="one-time-code"
        inputMode="numeric"
        containerClassName={s.root({ class: [slots.root, containerClassName] })}
        className={s.input({ class: [slots.input, className] })}
        {...rest}
      >
        {children ?? (
          <InputOTPGroup>
            {Array.from({ length }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        )}
      </OTPInput>
    </PartsContext.Provider>
  )
}

export function InputOTPGroup({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="input-otp-group"
      className={s.group({ class: [slots.group, className] })}
      {...props}
    />
  )
}

export interface InputOTPSlotProps extends ComponentProps<'div'> {
  /** Position of the character this box shows, starting at 0. */
  index: number
}

export function InputOTPSlot({ index, className, ...props }: InputOTPSlotProps) {
  const { s, slots, invalid } = useParts()
  const slot = useContext(OTPInputContext).slots[index]
  return (
    <div
      data-slot="input-otp-slot"
      data-active={slot?.isActive ?? false}
      aria-invalid={invalid || undefined}
      className={s.slot({ class: [slots.slot, className] })}
      {...props}
    >
      {slot?.char ?? slot?.placeholderChar}
      {slot?.hasFakeCaret && (
        <div className={s.caret({ class: slots.caret })}>
          <div className={s.caretBar({ class: slots.caretBar })} />
        </div>
      )}
    </div>
  )
}

export function InputOTPSeparator({ className, ...props }: ComponentProps<'div'>) {
  const { s, slots } = useParts()
  return (
    <div
      data-slot="input-otp-separator"
      aria-hidden="true"
      className={s.separator({ class: [slots.separator, className] })}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M6 12h12" />
      </svg>
    </div>
  )
}
