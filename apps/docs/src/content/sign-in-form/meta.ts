import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SignInForm',
  slug: 'sign-in-form',
  category: 'Auth',
  status: 'beta',
  description:
    'The whole sign-in flow in one component: password, OAuth, email link, and the code steps the backend asks for.',
  entry: '@glyphui/auth/ui',
  exports: ['SignInForm', 'MagicLinkSent'],
  source: 'ui/sign-in-form.tsx',
  propsOf: 'SignInForm',
  examples: [
    {
      file: 'basic',
      title: 'Sign in',
      description:
        'ada@example.com / correct horse signs in; a wrong password shows the server’s message. Codes appear as toasts.',
    },
    {
      file: 'two-step',
      title: 'Two-step and email links',
      description:
        'grace@example.com / cobol rules continues to a code. "Email me a sign-in link" switches to passwordless.',
    },
  ],
  notes: [
    'OAuth buttons appear for every provider the adapter supports; pass providers={[]} to hide them.',
    'Passwords and emails use autocomplete hints so password managers fill and save them.',
    'onSuccess runs once the user is fully signed in; with React Router, pass useRedirectAfterSignIn().',
    'Errors with fieldErrors show next to the field; anything else shows above the form.',
  ],
})
