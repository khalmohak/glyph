import { Text, VisuallyHidden } from '@glyphui/ui'
import { Check, X } from 'lucide-react'

const plans = [
  { feature: 'Unlimited projects', free: false, pro: true },
  { feature: 'Custom themes', free: true, pro: true },
]

export default function Example() {
  return (
    <table className="text-small">
      <thead>
        <tr className="text-left text-muted-foreground">
          <th className="py-2 pr-8 font-medium">Feature</th>
          <th className="px-4 py-2 font-medium">Free</th>
          <th className="px-4 py-2 font-medium">Pro</th>
        </tr>
      </thead>
      <tbody>
        {plans.map((row) => (
          <tr key={row.feature} className="border-t border-border">
            <td className="py-2 pr-8">{row.feature}</td>
            {[row.free, row.pro].map((included, i) => (
              <td key={i} className="px-4 py-2">
                {included ? (
                  <Check className="size-4 text-success" aria-hidden="true" />
                ) : (
                  <X className="size-4 text-faint-foreground" aria-hidden="true" />
                )}
                <VisuallyHidden>{included ? 'Included' : 'Not included'}</VisuallyHidden>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <caption className="mt-3 caption-bottom">
        <Text size="caption" tone="faint">
          Icons are announced as “Included” or “Not included”.
        </Text>
      </caption>
    </table>
  )
}
