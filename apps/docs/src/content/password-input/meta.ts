import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'PasswordInput',
  slug: 'password-input',
  category: 'Forms',
  status: 'beta',
  description: 'A password field with a show/hide toggle and an optional strength meter.',
  entry: '@glyphui/ui',
  exports: ['PasswordInput', 'passwordStrength', 'passwordInputStyles'],
  source: 'components/password-input/password-input.tsx',
  propsOf: 'PasswordInput',
  examples: [
    { file: 'basic', title: 'Sign in' },
    {
      file: 'strength',
      title: 'New password with strength',
      description: 'passwordStrength() is exported too.',
    },
  ],
  notes: [
    'The toggle is a real button with aria-pressed, so screen readers announce whether the password is visible.',
    'The strength meter is a hint for people. Enforce password rules on the server.',
  ],
})
