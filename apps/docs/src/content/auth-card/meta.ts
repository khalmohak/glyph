import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'AuthCard',
  slug: 'auth-card',
  category: 'Blocks',
  status: 'beta',
  description:
    'Sign-in or sign-up card with a ready email and password form, social buttons and a footer link.',
  entry: '@glyphui/blocks',
  exports: ['AuthCard'],
  propsOf: 'AuthCard',
  examples: [
    {
      file: 'sign-in',
      title: 'Sign in',
      description: 'Use any email and the password “wrong” to see the error state.',
    },
    { file: 'sign-up', title: 'Sign up with social buttons' },
  ],
  notes: [
    'The built-in form validates email and password before calling onSubmit; throw to show a form-level error.',
    'Pass children to replace the built-in form with your own fields, for example a Form from @glyphui/ui/form.',
  ],
})
