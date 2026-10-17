import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Password reset',
  slug: 'password-reset',
  category: 'Auth',
  status: 'beta',
  description:
    'Request a reset email, then choose a new password from the link’s token or an emailed code.',
  entry: '@glyphui/auth/ui',
  exports: ['ForgotPasswordForm', 'ResetPasswordForm'],
  source: 'ui/password-forms.tsx',
  propsOf: 'ResetPasswordForm',
  examples: [
    {
      file: 'flow',
      title: 'Forgot, then reset',
      description:
        'Request a reset for ada@example.com; the toast shows the link token, which this demo passes straight to the reset form.',
    },
  ],
  notes: [
    'The confirmation never says whether an account exists, so emails can’t be probed.',
    'On your reset page, read the token from the URL: <ResetPasswordForm token={params.get("token")} />.',
    'For code-based backends (Clerk), ForgotPasswordForm continues straight to a code and new-password form.',
    'A hidden username field helps password managers update the right saved login.',
  ],
})
