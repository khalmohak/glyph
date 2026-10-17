import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Alert Dialog',
  slug: 'alert-dialog',
  category: 'Overlays',
  status: 'beta',
  description:
    'Interrupts to ask for a decision, such as confirming a destructive action. useConfirm() turns it into one awaited line.',
  entry: '@glyphui/ui',
  exports: [
    'AlertDialog',
    'AlertDialogTrigger',
    'AlertDialogContent',
    'AlertDialogHeader',
    'AlertDialogTitle',
    'AlertDialogDescription',
    'AlertDialogFooter',
    'AlertDialogCancel',
    'AlertDialogAction',
    'alertDialogStyles',
    'ConfirmProvider',
    'useConfirm',
  ],
  source: 'components/alert-dialog/alert-dialog.tsx',
  propsOf: 'AlertDialogActionProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/alert-dialog',
  examples: [
    {
      file: 'use-confirm',
      title: 'useConfirm',
      description: 'Resolves true when confirmed, false when cancelled or dismissed.',
    },
    {
      file: 'composed',
      title: 'Composed',
      description: 'Build the dialog yourself when it needs custom content.',
    },
  ],
  notes: [
    'Cancel receives focus when it opens, so pressing Enter never confirms by accident.',
    'Clicking the backdrop does not close it; the user has to choose.',
    'Mount ConfirmProvider once near the root to use useConfirm() anywhere below it.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Space or Enter', action: 'On the trigger: opens it and focuses the Cancel button.' },
      { keys: 'Tab', action: 'Moves between the actions; focus stays trapped while it is open.' },
      { keys: 'Esc', action: 'Cancels and returns focus to the trigger.' },
    ],
    notes: [
      'Uses role="alertdialog": screen readers announce the title and description when it opens.',
      "Clicking outside doesn't close it, so a decision is always explicit.",
      'useConfirm() renders the same dialog and resolves false on Esc.',
    ],
  },
})
