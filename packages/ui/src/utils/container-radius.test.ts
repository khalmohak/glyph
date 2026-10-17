import { describe, expect, it } from 'vitest'
import { alertStyles } from '../components/alert/alert.styles'
import { fileUploadStyles } from '../components/file-upload/file-upload.styles'
import { navigationMenuStyles } from '../components/navigation-menu/navigation-menu.styles'
import { stepperStyles } from '../components/stepper/stepper.styles'
import { chartStyles } from '../patterns/chart/chart.styles'
import { formErrorStyles } from '../patterns/form/form'

// `rounded-md` is the control radius. Themes like playful set it to a pill, so a container
// that can hold several lines must use a container radius or it renders as an oval.
describe('containers use a container radius', () => {
  const containers: [string, string][] = [
    ['Alert', alertStyles().root()],
    ['FormError', formErrorStyles().base()],
    ['chart tooltip', chartStyles().tooltip()],
    ['chart table', chartStyles().table()],
    ['chart skeleton', chartStyles().skeleton()],
    ['NavigationMenu card', navigationMenuStyles().card()],
    ['FileUpload item', fileUploadStyles().item()],
    ['Stepper step', stepperStyles().trigger()],
  ]
  it.each(containers)('%s', (_name, classes) => {
    expect(classes).not.toMatch(/(^|\s)rounded-md(\s|$)/)
    expect(classes).toMatch(/rounded-(lg|sm|\[)/)
  })
})
