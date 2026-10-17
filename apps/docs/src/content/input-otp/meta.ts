import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'InputOTP',
  slug: 'input-otp',
  category: 'Forms',
  status: 'beta',
  description:
    'One-time code input with a box per character, paste support and SMS autofill on mobile.',
  entry: '@glyphui/ui',
  exports: [
    'InputOTP',
    'InputOTPGroup',
    'InputOTPSlot',
    'InputOTPSeparator',
    'inputOtpStyles',
    'REGEXP_ONLY_DIGITS',
    'REGEXP_ONLY_CHARS',
    'REGEXP_ONLY_DIGITS_AND_CHARS',
  ],
  source: 'components/input-otp/input-otp.tsx',
  propsOf: 'InputOTP',
  examples: [
    { file: 'basic', title: 'Six digits', description: 'Verifies once the last digit is typed.' },
    {
      file: 'grouped',
      title: 'Custom groups',
      description: 'Compose groups and separators yourself.',
    },
  ],
  notes: [
    'It is one real input under the boxes, so paste, autofill and screen readers work as with a normal field.',
    'Restrict characters with pattern, e.g. REGEXP_ONLY_DIGITS.',
  ],
  a11y: {
    keyboard: [
      {
        keys: 'Typing, Backspace, arrow keys and paste',
        action: 'Behave like a normal text field: it is one input under the hood.',
      },
    ],
    notes: ['Supports one-time-code autofill (autocomplete="one-time-code") on phones.'],
  },
})
