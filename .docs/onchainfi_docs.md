Here you go, **clean + structured + fully valid Markdown (.md)**.
I preserved **all content**, fixed hierarchy, added code blocks, headings, spacing, and readability.

---

# **Onchain Documentation**

Smart x402 payment routing with automatic failover across multiple facilitators.

---

## **What is Onchain?**

Onchain is an intelligent intermediary layer for x402 payments.

Instead of integrating with a single facilitator (Coinbase CDP, x402.rs, Daydreams, Aurracloud, OpenX402, thirdweb, PayAI, OctonetAI, Anyspend, Heurist, Treasure, etc.), integrate once with Onchain and get:

* automatic routing across multiple facilitators
* failover
* cost optimization
* speed prioritization
* cross-chain payment support (Solana ↔ Base)

---

## **Why Onchain?**

Onchain is a payment aggregator for x402 payments.

Launching with Base support, Onchain routes your payments across multiple facilitators with intelligent selection and automatic failover.

Additional networks coming soon.

---

## 🔄 **Multi-Facilitator Routing + Cross-Chain**

Access multiple x402 facilitators through a single integration:

* Coinbase CDP
* x402.rs
* Daydreams
* Aurracloud
* OpenX402
* thirdweb
* PayAI
* OctonetAI
* Anyspend
* Heurist
* Treasure

Supports:

* **same-chain** (Base → Base, Solana → Solana)
* **cross-chain** (Solana → Base, Base → Solana)

Automatic failover if a facilitator is down.

---

## 🎯 **Intelligent Selection**

Optimize routing for:

* **speed**
* **cost**
* **reliability**

Onchain scores each facilitator in real time.

---

## 🌐 **Language Agnostic**

Simple REST API works with:

Python • Node.js • Go • Ruby • PHP • Java • Rust • anything HTTP.

No SDK required.

---

## ⚡ **Production Ready**

* battle-tested error handling
* automatic retries
* health monitoring
* rate limiting

---

# **Simple REST API Integration**

Call the Onchain API from any language.

---

## **Verify Payment**

```bash
curl -X POST https://api.onchain.fi/v1/verify \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentHeader": "base64-payment-header",
    "sourceNetwork": "base",
    "destinationNetwork": "base",
    "expectedAmount": "1.00",
    "expectedToken": "USDC",
    "recipientAddress": "0x..."
  }'
```

**Returns**

```json
{ "data": { "paymentId": "clxyz123..." } }
```

---

## **Settle Payment**

```bash
curl -X POST https://api.onchain.fi/v1/settle \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "clxyz123...",
    "paymentHeader": "base64-payment-header",
    "sourceNetwork": "base",
    "destinationNetwork": "base"
  }'
```

---

# **Quick Start**

Start accepting x402 payments by calling the REST API from any language.

---

## **1. Get Your API Key**

Request free API key:

👉 [https://onchain.fi/get-api-key](https://onchain.fi/get-api-key)

Or via curl:

```bash
curl -X POST https://api.onchain.fi/v1/api-keys/request \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

---

## **2. Create Payment Header & Verify**

The `paymentHeader` is a base64-encoded x402 authorization.

```bash
curl -X POST https://api.onchain.fi/v1/verify \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentHeader": "base64-encoded-x402-header",
    "sourceNetwork": "base",
    "destinationNetwork": "base",
    "expectedAmount": "1.00",
    "expectedToken": "USDC",
    "recipientAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

💡 **Learn how to build the payment header** in *Building x402 Header*.

---

## **3. Settle**

```bash
curl -X POST https://api.onchain.fi/v1/settle \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "clxyz123abc...",
    "paymentHeader": "base64-encoded-x402-header",
    "sourceNetwork": "base",
    "destinationNetwork": "base"
  }'
```

---

# **Language Examples**

* Python
* Node.js
* Go
* Ruby
* PHP
* Java
* Rust
* any HTTP client

---

# **@onchainfi/connect — Frontend SDK**

Wallet auth + x402 payments (React).

---

## **Installation**

```bash
npm install @onchainfi/connect
```

---

## **Quick Setup**

```tsx
// app/layout.tsx
import { OnchainConnect } from '@onchainfi/connect';

export default function RootLayout({ children }) {
  return (
    <OnchainConnect
      privyAppId="your-privy-app-id"
      onchainApiKey="your-onchain-api-key"
    >
      {children}
    </OnchainConnect>
  );
}
```

---

## **Features**

* 🔐 email, Twitter, GitHub logins
* 💸 built-in x402 payments
* 🌐 multi-chain ready
* 📦 TypeScript native

Docs: **github.com/onchainfi/connect**

---

# **@onchainfi/hyperlink — Payment Links**

Turn any text into a payment link.

---

## **Installation**

```bash
npm install @onchainfi/hyperlink
```

Requires: `@onchainfi/connect`.

---

## **Usage**

```tsx
import { PaymentLink } from '@onchainfi/hyperlink';

function BlogPost() {
  return (
    <article>
      <h1>My Article</h1>

      <p>
        Enjoyed this?{' '}
        <PaymentLink to="0x..." amount="0.50">
          Buy me a coffee ☕
        </PaymentLink>
      </p>
    </article>
  );
}
```

---

# **Express Middleware**

Protect Express routes with x402 payments.

---

## **Basic Example**

```ts
import { x402Middleware } from '@onchainfi/x402-aggregator-client';

app.use(x402Middleware({
  apiKey: process.env.ONCHAIN_API_KEY,
  recipientAddress: '0x742d35Cc66...',
  endpoints: {
    'GET /api/premium': {
      price: '$0.10',
      sourceNetwork: 'base',
      destinationNetwork: 'base'
    },
  },
}));
```

---

## **Advanced Example**

```ts
app.use(x402Middleware({
  apiKey: process.env.ONCHAIN_API_KEY,
  recipientAddress: '0x742d35Cc66...',

  endpoints: {
    'GET /api/basic': {
      price: '$0.05',
      sourceNetwork: 'base',
      destinationNetwork: 'base',
      priority: 'cost'
    },
    'POST /api/generate': {
      price: '$0.50',
      sourceNetwork: 'solana',
      destinationNetwork: 'base',
      priority: 'speed'
    },
  },

  defaultSourceNetwork: 'base',
  defaultDestinationNetwork: 'base',
  defaultPriority: 'balanced',
  autoSettle: true,
  skipRoutes: ['/health', '/metrics'],

  onSuccess: (payment) => {
    console.log('Payment settled:', payment.txHash);
  },

  onError: (error) => {
    console.error('Payment failed:', error.message);
  }
}));
```

---

# **Standalone Client (Node.js)**

## **Initialize**

```ts
import { X402Client } from '@onchainfi/x402-aggregator-client';

const client = new X402Client({
  apiKey: process.env.ONCHAIN_API_KEY,
});
```

---

## **Verify + Settle**

```ts
const verifyResult = await client.verify({
  paymentHeader,
  sourceNetwork: 'base',
  destinationNetwork: 'base',
  expectedAmount: '1.00',
  expectedToken: 'USDC',
  recipientAddress: '0x742d35Cc66...',
});

if (verifyResult.valid) {
  const settleResult = await client.settle({
    paymentId: verifyResult.paymentId,
    paymentHeader,
    sourceNetwork: 'base',
    destinationNetwork: 'base',
  });

  if (settleResult.settled) {
    console.log('Payment successful!', settleResult.txHash);
  }
}
```

---

# **Pay (Combined Verify + Settle)**

One-call payment processing.

---

## 🚨 **Intermediate address requirement**

Depending on chain:

| Payment Type    | Intermediate Address                           |
| --------------- | ---------------------------------------------- |
| Base → Base     | `0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1`   |
| Solana → Solana | `DoVABZK8r9793SuR3powWCTdr2wVqwhueV9DuZu97n2L` |
| Base → Solana   | `0x931Cc2F11C36C34b4312496f470Ff21474F2fA42`   |
| Solana → Base   | `AGm6Dzvd5evgWGGZtyvJE7cCTg7DKC9dNmwdubJg2toq` |

---

## **Request**

```bash
POST /v1/pay
{
  "paymentHeader": "base64-x402-header",
  "to": "0xFinalRecipient...",
  "sourceNetwork": "base",
  "destinationNetwork": "base",
  "expectedAmount": "1.00",
  "expectedToken": "USDC",
  "priority": "balanced",
  "idempotencyKey": "optional-id"
}
```

---

## **Response**

```json
{
  "status": "success",
  "data": {
    "txHash": "0x...",
    "verified": true,
    "settled": true,
    "sourceNetwork": "base",
    "destinationNetwork": "base",
    "facilitator": "Coinbase CDP",
    "amount": "1.00",
    "token": "USDC",
    "to": "0xFinalRecipient..."
  }
}
```

---

# **Verify**

```bash
POST /v1/verify
{
  "paymentHeader": "...",
  "sourceNetwork": "base",
  "destinationNetwork": "base",
  "expectedAmount": "1.00",
  "expectedToken": "USDC",
  "recipientAddress": "0x..",
  "priority": "balanced"
}
```

---

# **Settle**

```bash
POST /v1/settle
{
  "paymentId": "clxyz123abc...",
  "paymentHeader": "...",
  "sourceNetwork": "base",
  "destinationNetwork": "base"
}
```

---

# **Get Facilitators**

```bash
GET /v1/facilitators
```

---

# **Supported Networks**

```bash
GET /v1/supported
```

---

# **How x402 Works**

x402 = Coinbase-developed HTTP payment authentication for gasless ERC-3009 transfers.

---

# **Payment Header Extraction**

Examples for Node.js, Python, Go, PHP included.

---

# **Building x402 Headers**

SDK: `@onchainfi/connect`

```ts
const result = await pay({
  amount: "1.00",
  token: "USDC",
  recipientAddress: "0x742d...",
  apiKey: "your-api-key"
});
```

---

# **Routing Priorities**

* `speed`
* `cost`
* `reliability`
* `balanced` (default)

---

# **Error Handling**

With typed errors.

---

# **API Key Security**

Do:

* use env vars
* rotate keys
* separate keys per env

Don't:

* commit keys
* expose client side

---

# **Rate Limits**

**Payments:** 100/min per IP
**API key requests:** 3/hour per email

---

# **Best Practices**

* env variables
* custom error handler
* test on testnets
* monitor payments

---

If you want, I can also:

✅ generate **TOC (table of contents)**
✅ convert this into **GitHub-ready README.md**
✅ format for **Docusaurus / Nextra**
✅ compress into “short docs” or “dev-quickstart only”

Just tell me.
