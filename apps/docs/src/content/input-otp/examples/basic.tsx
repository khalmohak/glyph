import { Field, InputOTP, REGEXP_ONLY_DIGITS } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'done'>('idle')
  return (
    <Field
      label="Verification code"
      description={
        status === 'done'
          ? 'Verified.'
          : status === 'checking'
            ? 'Checking…'
            : 'We sent a code to •••• 4821.'
      }
    >
      <InputOTP
        pattern={REGEXP_ONLY_DIGITS}
        onComplete={() => {
          setStatus('checking')
          setTimeout(() => setStatus('done'), 800)
        }}
      />
    </Field>
  )
}
