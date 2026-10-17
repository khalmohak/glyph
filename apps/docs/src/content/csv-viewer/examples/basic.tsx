import { CsvViewer } from '@glyphui/viewers/csv'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return <CsvViewer source={fixture('customers.csv')} height={420} className="w-full" />
}
