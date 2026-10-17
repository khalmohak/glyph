import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Code forms',
  slug: 'verify-email-form',
  category: 'Auth',
  status: 'beta',
  description:
    'Six-digit code steps: confirm an email after sign-up, or a second factor at sign-in. SignInForm and SignUpForm show them for you.',
  entry: '@glyphui/auth/ui',
  exports: ['VerifyEmailForm', 'TwoFactorForm', 'secondFactorDescription'],
  source: 'ui/code-forms.tsx',
  propsOf: 'VerifyEmailForm',
  examples: [
    {
      file: 'verify',
      title: 'Verify an email',
      description: 'Paste or type the code from the toast; it submits on the sixth digit.',
    },
  ],
  notes: [
    'The input uses autocomplete="one-time-code", so phones offer the code from SMS or email.',
    'Resend waits 30 seconds between sends.',
    'A wrong code clears the input and shows the server’s message.',
    'TwoFactorForm words its step from method: "totp" (an authenticator app, the default), "email" (with the address) or "sms". SignInForm passes the method your server sends; override the text with twoFactor={{ title, description }}.',
  ],
})
