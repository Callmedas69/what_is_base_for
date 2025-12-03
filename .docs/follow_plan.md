Here’s **your clean, final recap**, C — the *exact recipe* to build a **Farcaster MiniApp with Follow → (Recast) → Mint**, fully powered by **OnchainConnect**.

---

# ⭐ **Farcaster MiniApp — FOLLOW → MINT RECAP**

This is the entire system in **one tight summary**.

---

# 1️⃣ **MINIAPP FLOW**

```
User opens MiniApp
 → OnchainConnect gives you FID + wallet
 → Backend checks:
     - Follows your Farcaster account?
     - Recasted your cast? (optional)
 → If not: show “Follow Now” / “Recast Now” buttons
 → If yes: show Mint Button
 → Mint uses OnchainConnect.executeTransaction()
 → Warpcast shows success modal
```

---

# 2️⃣ **WRAP APP WITH ONCHAINCONNECT**

```tsx
<OnchainConnect
  privyAppId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
  onchainApiKey={process.env.NEXT_PUBLIC_ONCHAIN_API_KEY}
>
  {children}
</OnchainConnect>
```

OnchainConnect gives you:

* FID (fcProfile)
* Wallet (address)
* Safe transaction execution (no Wagmi)
* Payment support (optional)

---

# 3️⃣ **FOLLOW CHECK API**

`/api/check-follow`

```ts
const CREATOR_FID = 123456;

GET https://api.neynar.com/v2/farcaster/user/follows?fid=USER&target_fid=CREATOR
```

Returns:

```json
{ "ok": true | false }
```

---

# 4️⃣ **RECAST CHECK API (Optional)**

`/api/check-recast`

```ts
GET https://api.neynar.com/v2/farcaster/cast/recasters?cast_hash=HASH
```

Returns:

```json
{ "ok": true | false }
```

---

# 5️⃣ **MINT PAGE LOGIC**

Inside `/miniapps/mint/page.tsx`:

* Retrieve user FID from OnchainConnect
* Run follow check
* Run recast check
* Block UI if needed
* If allowed → show “Mint” button

---

# 6️⃣ **MINT USING ONCHAINCONNECT**

You encode your mint function:

```ts
const data = encodeFunctionData({
  abi: NFTABI,
  functionName: "mint",
  args: [],
});
```

Then execute:

```ts
executeTransaction({
  chainId: 8453,
  to: NFT_ADDRESS,
  data
});
```

This automatically:

* handles signatures
* runs aggregator-safe transactions
* avoids gas failures
* works seamlessly inside Warpcast

---

# 7️⃣ **REGISTER MINIAPP ACTION**

In Neynar Actions:

```
Name: Follow to Mint
Callback URL: https://yourapp.xyz/miniapps/mint
```

This enables “Open App” in Warpcast.

---

# 🎯 **DONE — You now have:**

* Farcaster MiniApp
* OnchainConnect wallet + safe mint
* Follow gate
* Recast gate
* Full UX compatible with Warpcast
* No Wagmi needed
* Production-ready flow (same as Zora, BasedNouns, etc.)

---