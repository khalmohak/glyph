import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Stepper',
  slug: 'stepper',
  category: 'Navigation',
  status: 'beta',
  description:
    'Progress through a multi-step flow such as onboarding or checkout, horizontal or vertical.',
  entry: '@glyphui/ui',
  exports: ['Stepper', 'stepperStyles'],
  source: 'components/stepper/stepper.tsx',
  propsOf: 'Stepper',
  examples: [
    {
      file: 'wizard',
      title: 'Wizard',
      description: 'Completed steps are clickable when onStepClick is set.',
    },
    { file: 'vertical', title: 'Vertical with descriptions' },
    {
      file: 'error',
      title: 'Error state',
      description: 'Override a step’s status to flag a problem.',
    },
  ],
  notes: [
    'Renders an ordered list; the current step has aria-current="step" and every step announces its status.',
    'Statuses come from current: earlier steps are complete, later ones upcoming. Set status on a step to override.',
  ],
})
