Got you, **0xd**.
Here is a **clean, developer-friendly, simplified .md version** — optimized for readability, skimmability, and direct copy-paste into docs.

No clutter. No repetition. Pure dev-focused clarity.

---

# x402 Payments – Developer Guide (Clean Version)

Secure your API routes or backend flows with x402 payments.
Supports **same-chain** and **cross-chain** payments across **Base** and **Solana**.

---

# 1. Express Middleware

Add x402 payments to any Express API route.

### Basic Usage

```ts
import { x402Middleware } from '@onchainfi/x402-aggregator-client';

app.use(
  x402Middleware({
    apiKey: process.env.ONCHAIN_API_KEY,
    recipientAddress: '0xRecipient...',
    endpoints: {
      'GET /api/premium': {
        price: '$0.10',
        sourceNetwork: 'base',
        destinationNetwork: 'base',
      },
    },
  })
);
```

---

### Advanced Options

```ts
app.use(
  x402Middleware({
    apiKey: process.env.ONCHAIN_API_KEY,
    recipientAddress: '0xRecipient...',

    endpoints: {
      'GET /api/basic': {
        price: '$0.05',
        sourceNetwork: 'base',
        destinationNetwork: 'base',
        priority: 'cost',
      },
      'POST /api/generate': {
        price: '$0.50',
        sourceNetwork: 'solana',
        destinationNetwork: 'base', // Solana → Base
        priority: 'speed',
      },
    },

    defaultSourceNetwork: 'base',
    defaultDestinationNetwork: 'base',
    defaultPriority: 'balanced',

    autoSettle: true,
    skipRoutes: ['/health', '/metrics'],

    onSuccess: (payment) => console.log('Settled:', payment.txHash),
    onError: (error) => console.error('Payment failed:', error.message),
  })
);
```

---

# 2. Standalone Client (No Express)

Use directly in Node.js.

### Initialize

```ts
import { X402Client } from '@onchainfi/x402-aggregator-client';

const client = new X402Client({
  apiKey: process.env.ONCHAIN_API_KEY,
});
```

---

### Verify + Settle Flow

```ts
// Verify
const verify = await client.verify({
  paymentHeader,
  sourceNetwork: 'base',
  destinationNetwork: 'base',
  expectedAmount: '1.00',
  expectedToken: 'USDC',
  recipientAddress: '0xRecipient...',
});

if (verify.valid) {
  const settle = await client.settle({
    paymentId: verify.paymentId,
    paymentHeader,
    sourceNetwork: 'base',
    destinationNetwork: 'base',
  });

  if (settle.settled) {
    console.log('Success:', settle.txHash);
  }
}
```

---

# 3. Configuration Overview

## Client Config

| Key          | Description                 |
| ------------ | --------------------------- |
| `apiKey`     | Your Onchain API key        |
| `apiBaseUrl` | Override API URL (optional) |
| `timeout`    | Default: 30s                |
| `retries`    | Default: 3                  |

## Endpoint Config

| Key                  | Description                                |
| -------------------- | ------------------------------------------ |
| `price`              | e.g., `"$0.10"` or `"1 USDC"`              |
| `sourceNetwork`      | `"base"` / `"solana"`                      |
| `destinationNetwork` | `"base"` / `"solana"`                      |
| `priority`           | `speed`, `cost`, `reliability`, `balanced` |
| `token`              | Default: `USDC`                            |

---

# 4. `/pay` – One-Call Payment (Recommended)

Combine **verify + settle** in a single API call.

### Why use `/pay`?

✔ Simplest flow
✔ No need to manage `paymentId`
✔ Backend extracts intermediate address automatically
✔ Works same-chain & cross-chain

---

## ⚠️ Important: Sign to the Intermediate Address

Your x402 signature must be signed to one of these:

| Flow            | Intermediate                                   |
| --------------- | ---------------------------------------------- |
| Base → Base     | `0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1`   |
| Solana → Solana | `DoVABZK8r9793SuR3powWCTdr2wVqwhueV9DuZu97n2L` |
| Base → Solana   | `0x931Cc2F11C36C34b4312496f470Ff21474F2fA42`   |
| Solana → Base   | `AGm6Dzvd5evgWGGZtyvJE7cCTg7DKC9dNmwdubJg2toq` |

`to` = final recipient
Signature = intermediate address

---

## Request

```json
{
  "paymentHeader": "base64-x402-header",
  "to": "0xFinalRecipient...",
  "sourceNetwork": "base",
  "destinationNetwork": "base",
  "expectedAmount": "1.00",
  "expectedToken": "USDC",
  "priority": "balanced"
}
```

## Response

```json
{
  "status": "success",
  "data": {
    "settled": true,
    "txHash": "0x...",
    "facilitator": "Coinbase CDP"
  }
}
```

---

# 5. Verify Only (`/v1/verify`)

Use when you need a two-step flow.

```json
{
  "paymentHeader": "...",
  "sourceNetwork": "base",
  "destinationNetwork": "base",
  "expectedAmount": "1.00",
  "recipientAddress": "0x...",
  "priority": "balanced"
}
```

Response contains `paymentId` → required for settlement.

---

# 6. Settle Only (`/v1/settle`)

```json
{
  "paymentId": "clxyz...",
  "paymentHeader": "...",
  "sourceNetwork": "base",
  "destinationNetwork": "base"
}
```

Returns:

```json
{
  "data": { "settled": true, "txHash": "0x..." }
}
```

---

# 7. Facilitators

```http
GET /v1/facilitators
```

Check facilitator health, fees, and supported networks.

---

# 8. Supported Networks

```http
GET /v1/supported
```

Mainnet:

* Base (full)
* Solana (full)

Testnet:

* Base Sepolia
* Solana Devnet

Cross-chain supported both ways:

* Base → Solana
* Solana → Base

---

# 9. Cross-Chain Examples

### Solana → Base

User pays Solana, merchant receives Base.

### Base → Solana

User pays Base, merchant receives Solana.

### Base → Base

Standard same-chain.

---

# Want even cleaner?

I can also generate:

✅ A **mini version** (1-page)
✅ A **docs folder version** (`/docs/payments.md`)
✅ A **copy-paste snippet pack**
✅ A **Farcaster MiniApp-optimized** version

Just say **"C, give me the mini version"**.
