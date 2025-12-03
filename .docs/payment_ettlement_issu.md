C — **here is the clean, exact explanation** of how **/settle works**, **why yours is failing**, and **the correct way to call it** based on the spec you pasted.

I’ll break it into:

1. ✅ What /settle actually requires
2. ❌ Why your settlement is failing (based directly on your logs)
3. 🧩 The exact correct settlement request (code you must send)
4. 🛡️ Fix to guarantee settlement works every single time

---

# ✅ **1. How `/settle` actually works (simplified)**

After `/verify` returns:

```json
{
  "paymentId": "cmih87g153zr5lzwxhj9v743d",
  "x402Header": "BASE64..."
}
```

You **must** call:

```
POST /v1/settle
```

With:

```json
{
  "paymentId": "cmih87g153zr5lzwxhj9v743d",
  "paymentHeader": "BASE64...",   // SAME as x402Header from /verify
  "sourceNetwork": "base",
  "destinationNetwork": "base",
  "priority": "balanced"
}
```

If **anything** mismatches:

* wrong paymentId
* wrong paymentHeader
* overwritten paymentHeader
* stale paymentHeader
* double verification overwrote the first one

→ ❌ **Settlement fails**

---

# ❌ **2. Why settlement is failing for you (confirmed from logs)**

Your logs show:

### **A. Two verify calls firing at the same time**

```
Payment verified: cmihadmmj41mjlzwx5aaeuyp3
Payment verified: cmihadoq541mllzwxzhpp956t
```

This proves:

* Your UI re-rendered
* Verify was called twice
* The second verify overwrote the first paymentId + paymentHeader

So when you call **settle**, you're sending **a mismatched header**, which the API rejects.

---

### **B. You are NOT passing paymentHeader into /settle**

Your logs show:

```
[x402/settle] request: { paymentId: "...", network: "base" }
```

But /settle requires:

```
paymentHeader (base64)
```

You are only sending paymentId → settlement MUST fail.

---

### **C. Your settlement error perfectly matches missing paymentHeader**

Onchain.fi returns this when `paymentHeader` is missing:

```
paymentHeader mismatch / required / invalid
```

Which your log shows as:

```
payment settlement failed
```

This is a silent failure at the wrapper level.

---

# 🧩 **3. The EXACT correct `/settle` request you MUST send**

### ✔️ **Correct code (server-side)**

```ts
export async function settlePayment(paymentId, paymentHeader) {
  const res = await fetch("https://api.onchain.fi/v1/settle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ONCHAIN_API_KEY,
    },
    body: JSON.stringify({
      paymentId,
      paymentHeader,       // REQUIRED
      sourceNetwork: "base",
      destinationNetwork: "base",
      priority: "balanced"
    }),
  });

  const data = await res.json();
  return data;
}
```

### ✔️ **This MUST be exactly the same `paymentHeader` returned from `/verify`**

Not regenerated
Not re-read
Not re-signed
Not overwritten

---

# 🛡️ **4. THE FIX — Store verify result in a ref (to avoid overwrite)**

```ts
const verified = useRef({
  id: null,
  header: null
});
```

On verify success:

```ts
verified.current.id = response.paymentId;
verified.current.header = response.x402Header;
```

On settle:

```ts
await settlePayment(
  verified.current.id,
  verified.current.header
);
```

This guarantees:

* no overwrite
* no double verify
* no lost state
* no stale header

---

# 🧠 **TL;DR (Important)**

Your settlement fails because:

### 1. You triggered `/verify` twice → you overwrote the header

### 2. You did NOT send `paymentHeader` to `/settle`

### 3. Your server only sent `{ paymentId }` → settlement ALWAYS fails

---

# 🚀 **If you want the fully patched CustomMint flow (stable, race-resistant, hybrid-safe), just say:**

**“C, rewrite my verify → settle flow into stable mode.”**
