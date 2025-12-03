# Custom Wallet Connect - Environment-Based Implementation

## Problem (Confirmed via Screenshot)

1. **MiniApp UX Issue**: Privy modal shows social login (email, X, GitHub) even with `loginMethods={['wallet']}` configured
2. **Post-Connect Issue**: Clicking wallet icon after connection shows no modal (can't disconnect/see details)

---

## Solution: KISS Approach

### Core Concept

```
IF Farcaster MiniApp:
  → Use sdk.wallet.ethProvider directly (no modal)

IF Web:
  → Use existing useOnchainWallet().login()
```

### Farcaster SDK Reference

From `@farcaster/miniapp-sdk` types (verified in node_modules):

```typescript
wallet: {
    ethProvider: Provider.Provider;  // EIP-1193 Provider
    getEthereumProvider: () => Promise<Provider.Provider | undefined>;
}
```

---

## Implementation (Single File)

### Create Custom Connect Button

**File: `components/wallet/CustomWalletConnect.tsx`**

Single component, no separate hook needed:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useOnchainWallet } from '@onchainfi/connect';
import { useFarcaster } from '@/contexts/FarcasterContext';

interface CustomWalletConnectProps {
  className?: string;
}

export function CustomWalletConnect({ className }: CustomWalletConnectProps) {
  const { isFarcaster, isReady } = useFarcaster();
  const { isConnected: privyConnected, address: privyAddress, login, logout } = useOnchainWallet();

  // MiniApp wallet state (only used when isFarcaster)
  const [fcAddress, setFcAddress] = useState<string | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Auto-connect in MiniApp mode
  useEffect(() => {
    if (isFarcaster && isReady && !fcAddress) {
      connectFarcaster();
    }
  }, [isFarcaster, isReady]);

  async function connectFarcaster() {
    setIsConnecting(true);
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) return;

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts?.[0]) {
        setFcAddress(accounts[0]);
      }
    } catch (error) {
      console.error('[CustomWallet] Farcaster connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  // Unified state
  const isConnected = isFarcaster ? !!fcAddress : privyConnected;
  const address = isFarcaster ? fcAddress : privyAddress;

  function handleClick() {
    if (isConnected) {
      setShowMenu(!showMenu);
      return;
    }

    if (isFarcaster) {
      connectFarcaster();
    } else {
      login();
    }
  }

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isConnecting}
        className={className || "px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-40"}
      >
        {isConnecting ? "Connecting..." : isConnected ? short : "Connect Wallet"}
      </button>

      {showMenu && isConnected && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          <div className="px-3 py-2 text-sm text-gray-500 border-b">{short}</div>
          {!isFarcaster && (
            <button
              onClick={() => { logout(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={() => setShowMenu(false)}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
```

### Update Header

**File: `components/Header.tsx`**

```diff
- import { BalanceDisplay, WalletButton } from "@onchainfi/connect";
+ import { BalanceDisplay } from "@onchainfi/connect";
+ import { CustomWalletConnect } from "@/components/wallet/CustomWalletConnect";

// In JSX:
- <WalletButton position="inline" />
+ <CustomWalletConnect />
```

---

## Files to Modify

1. **Create**: `components/wallet/CustomWalletConnect.tsx`
2. **Edit**: `components/Header.tsx`

**NO changes to HomeContent.tsx** - `useOnchainWallet()` still works for address in mint functions.

---

## Open Question (Needs Testing)

**Will wagmi `useWriteContract` work in MiniApp mode?**

Current setup uses `useOnchainWallet()` for address in HomeContent. Wagmi may or may not detect Farcaster's ethProvider.

**Test first, fix if needed.** Don't over-engineer until we know there's a problem.

---

## KISS Compliance

| Principle | Status |
|-----------|--------|
| Single file, no separate hook | ✅ |
| Reuses existing `useFarcaster()` context | ✅ |
| No changes to mint logic until proven needed | ✅ |
| Based on verified SDK types | ✅ |
