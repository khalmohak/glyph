# Ledgerline API

Send invoices, collect payments, and keep your books in sync.

> The API is versioned by date. Pin `Ledgerline-Version: 2026-10-01` in every request.

## Quick start

1. Create an API key in **Settings → API keys**.
2. Install the client: `npm install @ledgerline/node`.
3. Send your first invoice:

```ts
import { Ledgerline } from '@ledgerline/node'

const client = new Ledgerline(process.env.LEDGERLINE_KEY)
const invoice = await client.invoices.create({ customer: 'cus_42', amount: 1250 })
console.log(invoice.hostedUrl)
```

## Rate limits

| Plan | Requests per minute | Burst |
| --- | ---: | ---: |
| Starter | 60 | 10 |
| Growth | 600 | 100 |
| Enterprise | Custom | Custom |

## Checklist

- [x] Webhooks verified with signatures
- [x] Idempotency keys on every POST
- [ ] Sandbox for test mode

See the [full reference](https://example.com/docs) for every endpoint.
