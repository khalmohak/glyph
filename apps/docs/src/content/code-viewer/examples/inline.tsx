import { CodeViewer } from '@glyphui/viewers/code'

const code = `def monthly_recurring_revenue(subscriptions):
    """Sum active subscriptions, normalizing annual plans to a monthly amount."""
    total = 0
    for sub in subscriptions:
        if sub.status != "active":
            continue
        total += sub.amount / 12 if sub.interval == "year" else sub.amount
    return round(total, 2)`

export default function Example() {
  return <CodeViewer code={code} language="python" fileName="metrics.py" wrap className="w-full" />
}
