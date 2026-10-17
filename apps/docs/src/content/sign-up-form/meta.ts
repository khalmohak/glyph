import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SignUpForm',
  slug: 'sign-up-form',
  category: 'Auth',
  status: 'beta',
  description:
    'Account creation with name, email and a password strength meter, then the email-code step, ending signed in.',
  entry: '@glyphui/auth/ui',
  exports: ['SignUpForm'],
  source: 'ui/sign-up-form.tsx',
  propsOf: 'SignUpForm',
  examples: [
    {
      file: 'basic',
      title: 'Sign up and verify',
      description:
        'The 6-digit code arrives as a toast; it submits itself once all digits are in. ada@example.com is taken.',
    },
  ],
  notes: [
    'An "email taken" error from the server shows on the email field.',
    'For link-based verification (Firebase), it shows "Confirm your email" instead of a code input.',
    'terms renders above the button, e.g. links to your terms and privacy policy.',
  ],
})
