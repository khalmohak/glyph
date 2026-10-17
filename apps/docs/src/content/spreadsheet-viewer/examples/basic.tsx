import { SpreadsheetViewer } from '@glyphui/viewers/spreadsheet'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return <SpreadsheetViewer source={fixture('sales.xlsx')} height={420} className="w-full" />
}
