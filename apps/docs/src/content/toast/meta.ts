import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Toast',
  slug: 'toast',
  category: 'Feedback',
  status: 'beta',
  description:
    'Brief notifications sent from anywhere with toast(). Built on Sonner and styled entirely by the theme.',
  entry: '@glyphui/ui',
  exports: ['Toaster', 'toast', 'toastStyles'],
  source: 'components/toast/toast.tsx',
  propsOf: 'ToasterProps',
  examples: [
    { file: 'types', title: 'Types' },
    {
      file: 'promise',
      title: 'Promise',
      description: 'One toast that follows a request from loading to success or error.',
    },
    {
      file: 'action',
      title: 'With an action',
      description: 'Offer an undo instead of a confirmation dialog.',
    },
  ],
  notes: [
    'Mount one <Toaster /> near the root; call toast() from anywhere, including outside React.',
    'Toasts are announced to screen readers and pause while hovered.',
  ],
  a11y: {
    keyboard: [
      {
        keys: 'Alt + T',
        action: "Moves focus to the notifications region (Sonner's default hotkey).",
      },
    ],
    notes: ["Toasts are announced politely through a live region; error toasts don't steal focus."],
  },
})
