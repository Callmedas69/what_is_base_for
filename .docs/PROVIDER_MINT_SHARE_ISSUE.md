# 🔧 Provider, Mint & Share Fix Plan

## Document Purpose
This document outlines the implementation plan for:
1. **Unified FarcasterContext Provider** - Single global context for all components
2. **ShareButtons Fix** - Use SDK in MiniApp mode instead of URL-based sharing
3. **Minting Flow Clarification** - Document the correct flow vs GPT.md

---

## 📋 Issue Summary

### Issue 1: Fragmented FarcasterContext
**Current State:**
- `useFarcasterContext()` hook is called independently in multiple components
- Each call potentially re-initializes SDK
- Deep components (SuccessModal, ShareButtons) have no access to context
- Not truly persistent across modal lifecycles

**Impact:**
- Multiple SDK initializations
- ShareButtons can't use SDK actions
- Risk of context not being ready when modal opens

### Issue 2: ShareButtons Use URL-Based Sharing in MiniApp
**Current State (`components/ShareButtons.tsx:40-43`):**
```typescript
const handleShare = (platform: "twitter" | "farcaster") => {
  const shareUrl = platform === "twitter" ? twitterUrl : farcasterUrl;
  window.open(shareUrl, "_blank", ...); // Always URL-based
};
```

**Impact:**
- In Warpcast MiniApp, `window.open()` leaves the app
- Poor UX - user exits to browser then back to Warpcast
- Should use `sdk.actions.composeCast()` instead

### Issue 3: Minting Flow Is Incorrect
**GPT.md States (Correct):**
```
verify() → settle() → mint() → updateMintStatus()
```

**Current Implementation (Wrong):**
```
verify() → mint() → settle() → updateMintStatus()
```

**Problem:**
- Current code mints BEFORE payment is secured
- User gets NFT before payment settles
- Risk: payment fails but NFT already minted = loss

**Correct Rationale:**
- `verify()` = EIP-712 signature, user authorizes payment
- `settle()` = Payment secured BEFORE minting (protects project)
- `mint()` = NFT minted only after payment confirmed
- `updateMintStatus()` = Final tracking for audit

---

## 🏗️ Implementation Plan

### Phase 1: Create Unified FarcasterContext Provider

#### Step 1.1: Create Context Type Definitions
**File:** `types/farcaster.ts` (new)

```typescript
export interface FarcasterUser {
  fid: number | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
}

export interface FarcasterClient {
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface FarcasterActions {
  composeCast: (text: string, embeds?: string[]) => Promise<{ success: boolean; hash?: string }>;
  openUrl: (url: string) => Promise<void>;
  ready: () => void;
}

export interface FarcasterContextValue {
  // State flags
  isFarcaster: boolean;
  isReady: boolean;

  // User context
  user: FarcasterUser | null;

  // Client context (for mobile layout)
  client: FarcasterClient | null;

  // Actions
  actions: FarcasterActions;
}
```

#### Step 1.2: Create FarcasterProvider with Context
**File:** `contexts/FarcasterContext.tsx` (new)

Key features:
- Single SDK initialization at app root
- React Context for global state
- `useFarcaster()` hook for consuming context
- Actions wrapper (composeCast, openUrl, ready)
- Fallback actions for web mode (URL-based)
- Persistent across all components and modals

#### Step 1.3: Integrate Provider at Root Level
**File:** `app/layout.tsx`

```tsx
import { FarcasterMiniAppProvider } from "@/contexts/FarcasterContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FarcasterMiniAppProvider>
          {children}
        </FarcasterMiniAppProvider>
      </body>
    </html>
  );
}
```

#### Step 1.4: Simplify page.tsx
**File:** `app/page.tsx`

- Remove `useFarcasterContext()` call
- Use new `useFarcaster()` hook
- Cleaner routing logic

#### Step 1.5: Update MiniAppScreen
**File:** `app/(miniapp)/MiniAppScreen.tsx`

- Remove duplicate context hook
- Use `useFarcaster()` for actions
- Simplify sdk.ready() call using context action

#### Step 1.6: Remove Old FarcasterProvider
**File:** `app/(miniapp)/FarcasterProvider.tsx`

- Delete or repurpose (no longer needed as wrapper)

#### Step 1.7: Update MiniAppClientProviders
**File:** `app/(miniapp)/MiniAppClientProviders.tsx`

- Remove FarcasterProvider wrapper (now at root)
- Keep other providers (OnchainConnect, Neynar, Audio)

---

### Phase 2: Fix ShareButtons

#### Step 2.1: Update ShareButtons Component
**File:** `components/ShareButtons.tsx`

Changes:
- Import `useFarcaster()` hook
- Check `isFarcaster && isReady`
- If in MiniApp: use `actions.composeCast()` for Farcaster share
- If in web: use URL-based sharing (current behavior)
- Handle Twitter/X consistently (openUrl in MiniApp, URL in web)

```tsx
export function ShareButtons({ text, url, imageUrl, ... }) {
  const { isFarcaster, isReady, actions } = useFarcaster();

  const handleFarcasterShare = async () => {
    if (isFarcaster && isReady) {
      // Use SDK in MiniApp
      await actions.composeCast(text, [url, imageUrl].filter(Boolean));
    } else {
      // Fallback to URL in web
      window.open(farcasterUrl, "_blank", ...);
    }
  };

  const handleTwitterShare = async () => {
    if (isFarcaster && isReady) {
      // Use SDK openUrl to keep user in app
      await actions.openUrl(twitterUrl);
    } else {
      window.open(twitterUrl, "_blank", ...);
    }
  };

  // ... rest of component
}
```

#### Step 2.2: Update SuccessModal
**File:** `components/SuccessModal.tsx`

- No code changes needed if ShareButtons handles context internally
- Optionally: add safe-area-insets from context for mobile layout

---

### Phase 3: Fix Minting Flow

#### Step 3.1: Update CustomMint Component
**File:** `components/CustomMint.tsx`

Change flow from:
```typescript
// Current (Wrong)
const paymentData = await verifyPayment(...);
onMint(paymentData); // triggers mint immediately
```

To:
```typescript
// Correct
const paymentData = await verifyPayment(...);
await settlePayment(paymentData.paymentId, paymentData.paymentHeader);
onMint(paymentData); // mint only after payment settled
```

#### Step 3.2: Update HomeContent Component
**File:** `components/HomeContent.tsx`

Remove settle call from post-mint effect:
```typescript
// Remove this from useEffect after receipt
// await settlePayment(paymentData.paymentId, paymentData.paymentHeader, tokenId, txHash);
```

Add updateMintStatus call after successful mint:
```typescript
// After mint success
await updateMintStatus(paymentData.paymentId, 'minted', tokenId, txHash);
```

#### Step 3.3: Update useX402Payment Hook
**File:** `hooks/useX402Payment.ts`

Modify `settlePayment` to work without tokenId/txHash (pre-mint):
- Remove tokenId/txHash params from settle
- Add separate `updateMintStatus` call for post-mint tracking

#### Step 3.4: Flow Diagram (Correct)
```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Pay & Mint"                                   │
│                                                             │
│  1. verifyPayment()                                         │
│     └─ User signs EIP-712 (no funds move)                   │
│     └─ API: /api/x402/verify → status: "verified"           │
│                                                             │
│  2. settlePayment()                                         │
│     └─ SDK settle() → funds transferred                     │
│     └─ API: /api/x402/settle → status: "settled"            │
│                                                             │
│  3. mint()                                                  │
│     └─ writeContract() → on-chain mint                      │
│     └─ Wait for transaction receipt                         │
│                                                             │
│  4. updateMintStatus()                                      │
│     └─ API: /api/x402/update-mint-status                    │
│     └─ status: "minted", tokenId, txHash                    │
│                                                             │
│  5. Show SuccessModal                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Files Changed

| File | Action | Description |
|------|--------|-------------|
| **Phase 1: Unified Context** |||
| `types/farcaster.ts` | CREATE | Type definitions for Farcaster context |
| `contexts/FarcasterContext.tsx` | CREATE | Global provider + useFarcaster hook |
| `app/layout.tsx` | MODIFY | Wrap with FarcasterMiniAppProvider |
| `app/page.tsx` | MODIFY | Use new useFarcaster hook |
| `app/(miniapp)/MiniAppScreen.tsx` | MODIFY | Simplify, use context actions |
| `app/(miniapp)/FarcasterProvider.tsx` | DELETE | No longer needed |
| `app/(miniapp)/MiniAppClientProviders.tsx` | MODIFY | Remove FarcasterProvider wrapper |
| `hooks/useFarcasterContext.ts` | DELETE | Replaced by context |
| **Phase 2: ShareButtons** |||
| `components/ShareButtons.tsx` | MODIFY | Use SDK composeCast in MiniApp mode |
| **Phase 3: Minting Flow** |||
| `components/CustomMint.tsx` | MODIFY | Add settlePayment before onMint |
| `components/HomeContent.tsx` | MODIFY | Remove settle, add updateMintStatus |
| `hooks/useX402Payment.ts` | MODIFY | Adjust settle params, add updateMintStatus |

---

## 🧪 Testing Checklist

### Web Mode
- [ ] Page loads without errors
- [ ] Wallet connect works
- [ ] Regular mint works
- [ ] Custom mint works
- [ ] SuccessModal shows with NFT preview
- [ ] ShareButtons open in new tab (URL-based)
- [ ] Dock items open in new tab

### MiniApp Mode (Warpcast)
- [ ] App loads in Warpcast embed
- [ ] Splash screen dismisses (sdk.ready)
- [ ] Wallet connect via Farcaster works
- [ ] Regular mint works
- [ ] Custom mint works
- [ ] SuccessModal shows with NFT preview
- [ ] ShareButtons use SDK composeCast (stays in app)
- [ ] Dock items use SDK openUrl (stays in app)

### Custom Mint Payment Flow
- [ ] verify() prompts EIP-712 signature
- [ ] settle() transfers USDC before mint
- [ ] mint() only triggers after settle success
- [ ] updateMintStatus() records tokenId + txHash
- [ ] If settle fails, mint does not proceed
- [ ] Payment status tracked correctly in DB

### Edge Cases
- [ ] Modal open/close doesn't lose context
- [ ] Context persists across navigation
- [ ] No console errors about undefined context
- [ ] Preview mode (no user context) works

---

## 🔄 Migration Notes

### Breaking Changes
None - all changes are internal implementation details.

### Backwards Compatibility
- External APIs unchanged
- Props interfaces unchanged
- Component usage unchanged

### Rollback Plan
If issues occur:
1. Revert contexts/FarcasterContext.tsx
2. Restore hooks/useFarcasterContext.ts
3. Restore app/(miniapp)/FarcasterProvider.tsx
4. Revert layout.tsx, page.tsx, MiniAppScreen.tsx

---

## 📊 Architecture After Implementation

```
┌─────────────────────────────────────────────────────────────┐
│  layout.tsx                                                 │
│    └─ <FarcasterMiniAppProvider>  ← Single global init     │
│         │                                                   │
│         │  context = {                                      │
│         │    isFarcaster, isReady,                          │
│         │    user: { fid, username, displayName, pfpUrl },  │
│         │    client: { safeAreaInsets },                    │
│         │    actions: { composeCast, openUrl, ready }       │
│         │  }                                                │
│         │                                                   │
│         ├─ page.tsx                                         │
│         │    └─ useFarcaster() → routes to mode             │
│         │                                                   │
│         ├─ MiniAppScreen / WebScreen                        │
│         │    └─ HomeContent                                 │
│         │         └─ MintSection                            │
│         │              └─ CustomMint                        │
│         │                   └─ verifyPayment()              │
│         │                                                   │
│         │         └─ SuccessModal                           │
│         │              └─ ShareButtons                      │
│         │                   └─ useFarcaster()               │
│         │                        └─ actions.composeCast()   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Approval Required

Before implementation, please confirm:
1. Unified context at layout.tsx level is acceptable
2. ShareButtons SDK integration approach is correct
3. Minting flow fix: verify → settle → mint → updateMintStatus

---

*Document created: 2025-11-27*
*Status: ✅ IMPLEMENTED*

## Implementation Summary

All changes successfully implemented and build verified:

### Phase 1: Unified FarcasterContext ✅
- Created `types/farcaster.ts` - Type definitions
- Created `contexts/FarcasterContext.tsx` - Global provider with `useFarcaster()` hook
- Modified `app/layout.tsx` - Wrapped with `FarcasterMiniAppProvider`
- Modified `app/page.tsx` - Uses new `useFarcaster()` hook
- Modified `app/(miniapp)/MiniAppScreen.tsx` - Simplified using context actions
- Deleted `app/(miniapp)/FarcasterProvider.tsx` - No longer needed
- Modified `app/(miniapp)/MiniAppClientProviders.tsx` - Removed wrapper
- Deleted `hooks/useFarcasterContext.ts` - Replaced by context
- Updated `hooks/useFarcasterGate.ts` - Uses new hook

### Phase 2: ShareButtons Fix ✅
- Modified `components/ShareButtons.tsx` - Uses SDK in MiniApp, URL fallback in web

### Phase 3: Minting Flow Fix ✅
- Modified `hooks/useX402Payment.ts` - Added `recordMintSuccess()`, updated `settlePayment()`
- Modified `types/x402.ts` - Updated interface
- Modified `components/CustomMint.tsx` - Settle before mint
- Modified `components/HomeContent.tsx` - Record mint success post-mint

### Build Status
```
✓ Compiled successfully
✓ TypeScript passed
✓ Static pages generated (9/9)
```
