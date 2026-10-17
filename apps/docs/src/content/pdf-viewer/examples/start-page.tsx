import { PdfViewer } from '@glyphui/viewers/pdf'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return (
    <PdfViewer
      source={fixture('report.pdf')}
      defaultPage={3}
      defaultZoom="fit-page"
      thumbnails={false}
      height={520}
      className="w-full"
    />
  )
}
