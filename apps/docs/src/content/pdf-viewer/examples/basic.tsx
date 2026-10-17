import { PdfViewer } from '@glyphui/viewers/pdf'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return <PdfViewer source={fixture('report.pdf')} height={560} className="w-full" />
}
