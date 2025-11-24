# X402 Payment Integration with Onchain.fi

## **Overview**
Implement flexible pay-per-phrase custom minting with USDC payments via Onchain.fi's x402 aggregator.

**IMPORTANT**: No smart contract modifications needed. Payment tracking handled off-chain via Supabase.

---

## **Pricing Structure** (Incentivized Tier Model)
- **1 custom phrase**: 0.2 USDC
- **2 custom phrases**: 0.4 USDC
- **3 custom phrases**: 0.3 USDC ⭐ (Best value - 50% discount!)
- **Regular mint**: FREE (unchanged)
- **Custom mints**: Now PAID (removes 10/wallet free limit)

---

## **Implementation Plan**

### **Phase 1: Install Dependencies**

```bash
npm install @onchainfi/connect @supabase/supabase-js
```

Required packages:
- `@onchainfi/connect` - X402 payment SDK (includes Privy + Wagmi)
- `@supabase/supabase-js` - Database client for payment tracking

---

### **Phase 2: Supabase Database Setup**

1. **Create Supabase project** (if not exists)
2. **Create payment tracking table**:

```sql
-- Payment transactions table with Farcaster miniapp support
CREATE TABLE payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Payment info
  payment_id TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  phrase_count INTEGER NOT NULL CHECK (phrase_count IN (1, 2, 3)),
  amount_usdc DECIMAL(10, 6) NOT NULL,
  phrases JSONB NOT NULL,
  payment_header TEXT,
  source_network TEXT DEFAULT 'base',
  destination_network TEXT DEFAULT 'base',

  -- Status tracking
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'settled', 'failed')),
  mint_status TEXT NOT NULL DEFAULT 'not_started' CHECK (mint_status IN ('not_started', 'minting', 'minted', 'failed')),

  -- NFT info
  token_id BIGINT,
  tx_hash TEXT,

  -- Farcaster miniapp support
  farcaster_fid BIGINT,
  farcaster_username TEXT,
  source_platform TEXT DEFAULT 'web' CHECK (source_platform IN ('web', 'farcaster_miniapp', 'mobile')),

  -- Timestamps
  verified_at TIMESTAMP,
  settled_at TIMESTAMP,
  minting_started_at TIMESTAMP,
  minted_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Error tracking
  error_message TEXT,
  error_code TEXT
);

-- Indexes for fast lookups
CREATE INDEX idx_payment_id ON payment_transactions(payment_id);
CREATE INDEX idx_wallet_address ON payment_transactions(wallet_address);
CREATE INDEX idx_payment_status ON payment_transactions(payment_status);
CREATE INDEX idx_mint_status ON payment_transactions(mint_status);
CREATE INDEX idx_farcaster_fid ON payment_transactions(farcaster_fid);
CREATE INDEX idx_farcaster_username ON payment_transactions(farcaster_username);
CREATE INDEX idx_source_platform ON payment_transactions(source_platform);
CREATE INDEX idx_created_at ON payment_transactions(created_at DESC);
CREATE INDEX idx_token_id ON payment_transactions(token_id);

-- Composite index for Farcaster user lookups
CREATE INDEX idx_farcaster_user ON payment_transactions(farcaster_fid, farcaster_username) WHERE farcaster_fid IS NOT NULL;

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: View for Farcaster users
CREATE OR REPLACE VIEW farcaster_users_stats AS
SELECT
  farcaster_fid,
  farcaster_username,
  COUNT(*) as total_mints,
  COUNT(*) FILTER (WHERE mint_status = 'minted') as successful_mints,
  COUNT(*) FILTER (WHERE payment_status = 'settled') as paid_mints,
  SUM(amount_usdc) as total_spent_usdc,
  MIN(created_at) as first_mint_at,
  MAX(created_at) as last_mint_at
FROM payment_transactions
WHERE farcaster_fid IS NOT NULL
GROUP BY farcaster_fid, farcaster_username;
```

3. **Add environment variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_ONCHAIN_API_KEY=your-onchain-api-key
ONCHAIN_API_KEY=your-onchain-api-key (server-side)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
USDC_RECIPIENT_ADDRESS=0x... (your treasury)
NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS=0x... (same as above)
```

---

### **Phase 3: Wrap App with OnchainConnect Provider**

**Update app/layout.tsx**:

```tsx
import { OnchainConnect } from '@onchainfi/connect';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <OnchainConnect
          privyAppId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          onchainApiKey={process.env.NEXT_PUBLIC_ONCHAIN_API_KEY!}
        >
          {children}
        </OnchainConnect>
      </body>
    </html>
  );
}
```

**Note**: This replaces your current RainbowKit setup
- OnchainConnect includes Privy (auth) + Wagmi (wallets) + Onchain (payments)
- Migration needed from RainbowKit to Privy/OnchainConnect

---

### **Phase 4: Backend API Routes**

#### **`/app/api/x402/verify/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const {
      paymentHeader,
      phraseCount,
      phrases,
      walletAddress,
      farcasterFid,
      farcasterUsername,
      sourcePlatform = 'web',
    } = await req.json();

    // Calculate amount based on phrase count
    const amounts = { 1: '0.20', 2: '0.40', 3: '0.30' };
    const expectedAmount = amounts[phraseCount as keyof typeof amounts];

    // Verify payment with Onchain.fi
    const verifyResponse = await fetch('https://api.onchain.fi/v1/verify', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.ONCHAIN_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentHeader,
        sourceNetwork: 'base',
        destinationNetwork: 'base',
        expectedAmount,
        expectedToken: 'USDC',
        recipientAddress: process.env.USDC_RECIPIENT_ADDRESS!,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Store payment in Supabase with Farcaster data
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        payment_id: verifyData.data.paymentId,
        wallet_address: walletAddress.toLowerCase(),
        phrase_count: phraseCount,
        amount_usdc: expectedAmount,
        phrases: phrases,
        payment_status: 'verified',
        mint_status: 'not_started',
        payment_header: paymentHeader,
        verified_at: new Date().toISOString(),
        // Farcaster data
        farcaster_fid: farcasterFid || null,
        farcaster_username: farcasterUsername || null,
        source_platform: sourcePlatform,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      paymentId: verifyData.data.paymentId,
      transactionId: data.id,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### **`/app/api/x402/settle/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { paymentId, paymentHeader, tokenId, txHash, mintStatus = 'minted' } = await req.json();

    // Settle payment with Onchain.fi
    const settleResponse = await fetch('https://api.onchain.fi/v1/settle', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.ONCHAIN_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        paymentHeader,
        sourceNetwork: 'base',
        destinationNetwork: 'base',
      }),
    });

    if (!settleResponse.ok) {
      return NextResponse.json({ error: 'Payment settlement failed' }, { status: 400 });
    }

    // Update payment and mint status in Supabase
    const { error } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'settled',
        mint_status: mintStatus,
        token_id: tokenId,
        tx_hash: txHash,
        settled_at: new Date().toISOString(),
        minted_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### **`/app/api/x402/update-mint-status/route.ts`** (Mint Status Tracking)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { paymentId, mintStatus, errorMessage, errorCode } = await req.json();

    const updateData: any = {
      mint_status: mintStatus,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp based on status
    if (mintStatus === 'minting') {
      updateData.minting_started_at = new Date().toISOString();
    } else if (mintStatus === 'minted') {
      updateData.minted_at = new Date().toISOString();
    } else if (mintStatus === 'failed') {
      updateData.failed_at = new Date().toISOString();
      updateData.error_message = errorMessage || null;
      updateData.error_code = errorCode || null;
    }

    const { error } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('payment_id', paymentId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update mint status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### **`/app/api/x402/history/route.ts`** (Payment History)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.nextUrl.searchParams.get('wallet');
    const farcasterFid = req.nextUrl.searchParams.get('fid');

    if (!walletAddress && !farcasterFid) {
      return NextResponse.json(
        { error: 'Wallet address or Farcaster FID required' },
        { status: 400 }
      );
    }

    let query = supabase.from('payment_transactions').select('*');

    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress.toLowerCase());
    } else if (farcasterFid) {
      query = query.eq('farcaster_fid', parseInt(farcasterFid));
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ payments: data });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### **`/app/api/x402/farcaster-stats/route.ts`** (Farcaster User Stats)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const farcasterFid = req.nextUrl.searchParams.get('fid');

    if (!farcasterFid) {
      // Return all Farcaster users stats
      const { data, error } = await supabase
        .from('farcaster_users_stats')
        .select('*')
        .order('total_mints', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      return NextResponse.json({ stats: data });
    } else {
      // Return specific user stats
      const { data, error } = await supabase
        .from('farcaster_users_stats')
        .select('*')
        .eq('farcaster_fid', parseInt(farcasterFid))
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      return NextResponse.json({ stats: data });
    }
  } catch (error) {
    console.error('Farcaster stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### **Phase 5: Frontend Components & Hooks**

#### **1. Create Payment Hook - `hooks/useX402Payment.ts`**

```typescript
'use client';

import { useState } from 'react';
import { useOnchainPay } from '@onchainfi/connect';

export function useX402Payment() {
  const { generatePaymentHeader } = useOnchainPay();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const verifyPayment = async (
    phraseCount: number,
    phrases: string[],
    walletAddress: string
  ) => {
    setIsVerifying(true);
    try {
      const amounts = { 1: '0.20', 2: '0.40', 3: '0.30' };
      const amount = amounts[phraseCount as keyof typeof amounts];

      // Generate payment header using SDK
      const paymentHeader = await generatePaymentHeader({
        amount,
        token: 'USDC',
        recipient: process.env.NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS!,
      });

      // Verify with backend
      const response = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentHeader,
          phraseCount,
          phrases,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      return {
        paymentId: data.paymentId,
        transactionId: data.transactionId,
        paymentHeader,
      };
    } finally {
      setIsVerifying(false);
    }
  };

  const settlePayment = async (
    paymentId: string,
    paymentHeader: string,
    tokenId: bigint,
    txHash: string
  ) => {
    setIsSettling(true);
    try {
      const response = await fetch('/api/x402/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          paymentHeader,
          tokenId: tokenId.toString(),
          txHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Settlement failed');
      }

      return data;
    } finally {
      setIsSettling(false);
    }
  };

  return {
    verifyPayment,
    settlePayment,
    isVerifying,
    isSettling,
  };
}
```

#### **2. Create Phrase Selector - `components/PhraseSelector.tsx`**

```tsx
'use client';

interface PhraseSelectorProps {
  selected: number;
  onSelect: (count: number) => void;
}

const PRICING = {
  1: { price: '0.20', label: '1 phrase' },
  2: { price: '0.40', label: '2 phrases' },
  3: { price: '0.30', label: '3 phrases', badge: 'Best Value!' },
};

export function PhraseSelector({ selected, onSelect }: PhraseSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#0a0b0d]">How many phrases?</p>
      <div className="grid grid-cols-3 gap-2">
        {([1, 2, 3] as const).map((count) => (
          <button
            key={count}
            onClick={() => onSelect(count)}
            className={`relative rounded-lg border-2 px-4 py-3 text-center transition-all ${
              selected === count
                ? 'border-[#0000ff] bg-[#0000ff]/5'
                : 'border-[#dee1e7] hover:border-[#0000ff]/50'
            }`}
          >
            {PRICING[count].badge && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#0000ff] px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
                {PRICING[count].badge}
              </span>
            )}
            <div className="text-sm font-semibold text-[#0a0b0d]">
              {PRICING[count].label}
            </div>
            <div className="text-xs text-[#5b616e] mt-1">
              {PRICING[count].price} USDC
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

#### **3. Update CustomMint.tsx**

Add payment flow integration (see full implementation in repository)

#### **4. Update app/page.tsx**

Modify `handleCustomMint` to work with payment verification:

```typescript
const handleCustomMint = async (paymentData: { paymentId: string, paymentHeader: string }) => {
  // ... existing validation ...

  // Auto-wrap phrases
  const wrappedPhrase1 = phrases[0] ? `{${phrases[0]}}` : "";
  const wrappedPhrase2 = phrases[1] ? `{${phrases[1]}}` : "";
  const wrappedPhrase3 = phrases[2] ? `{${phrases[2]}}` : "";

  setMintType("custom");

  // Mint NFT
  const tx = await writeContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "mintWithCustomPhrases",
    args: [wrappedPhrase1, wrappedPhrase2, wrappedPhrase3],
  });

  // After successful mint, settle payment
  if (tx.hash && mintedTokenId) {
    await settlePayment(
      paymentData.paymentId,
      paymentData.paymentHeader,
      mintedTokenId,
      tx.hash
    );
  }
};
```

---

### **Phase 6: Configuration Updates**

**Update `lib/config.ts`**:

```typescript
/**
 * Payment Configuration for X402 Integration
 */
export const PAYMENT_CONFIG = {
  ENABLED: true,
  PRICES: {
    ONE_PHRASE: '0.20',
    TWO_PHRASES: '0.40',
    THREE_PHRASES: '0.30', // Best value - 50% discount!
  },
  TOKEN: 'USDC',
  NETWORK: 'base',
  RECIPIENT: process.env.NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS || '',
} as const;

/**
 * UI Messages - Add Payment Messages
 */
export const MESSAGES = {
  // ... existing messages ...
  PAYMENT_VERIFYING: 'Verifying payment...',
  PAYMENT_SETTLING: 'Settling payment...',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INSUFFICIENT_BALANCE: 'Insufficient USDC balance.',
} as const;
```

---

## **Technical Architecture**

```
User Flow (No Contract Changes):
1. User selects phrase count (1, 2, or 3)
2. Fills in phrase inputs
3. Clicks "Pay & Mint"
4. Frontend: Generate x402 header via SDK
5. Frontend: POST /api/x402/verify
6. Backend: Verify with Onchain.fi
7. Backend: Store in Supabase, return paymentId
8. Frontend: Call contract.mintWithCustomPhrases(phrases) - NORMAL MINT
9. Contract: Mint NFT (no payment verification in contract)
10. Frontend: On success, call /api/x402/settle with tokenId + txHash
11. Backend: Settle payment with Onchain.fi
12. Backend: Update Supabase with tokenId + status
13. User receives NFT!
```

---

## **Files to Create/Modify**

### **Backend API**
- ➕ `/app/api/x402/verify/route.ts` - Payment verification (with Farcaster support)
- ➕ `/app/api/x402/settle/route.ts` - Payment settlement
- ➕ `/app/api/x402/update-mint-status/route.ts` - Update mint status tracking
- ➕ `/app/api/x402/history/route.ts` - Payment history (wallet or FID)
- ➕ `/app/api/x402/farcaster-stats/route.ts` - Farcaster user statistics

### **Frontend Components**
- ✏️ `components/CustomMint.tsx` - Add phrase selector + payment + Farcaster context
- ✏️ `app/page.tsx` - Update mint flow with payment + status tracking
- ➕ `components/PhraseSelector.tsx` - Phrase count selector
- ➕ `hooks/useX402Payment.ts` - Payment hook with Farcaster support
- ➕ `hooks/useFarcasterContext.ts` - Farcaster miniapp context hook

### **Configuration**
- ✏️ `app/layout.tsx` - Wrap with OnchainConnect
- ✏️ `lib/config.ts` - Add PAYMENT_CONFIG
- ✏️ `.env.local` - Add all required env vars

### **Database**
- ➕ Supabase table: `payment_transactions` (with Farcaster fields)
- ➕ Supabase view: `farcaster_users_stats` (aggregated stats)

### **Farcaster Miniapp Integration**
- ➕ `app/frame/route.tsx` - Farcaster Frame metadata
- ➕ `lib/farcaster.ts` - Farcaster SDK utilities
- ➕ `types/farcaster.ts` - Farcaster type definitions

---

## **Testing Strategy**

1. **Supabase Setup**: Create table and test inserts
2. **API Testing**: Test verify/settle endpoints locally
3. **Frontend Testing**: Test payment flow on Base Sepolia
4. **Integration Testing**: Full flow with testnet USDC
5. **Production**: Deploy to Base mainnet

---

## **Security Considerations**

1. ✅ **API keys** stored server-side only (ONCHAIN_API_KEY, SUPABASE_SERVICE_ROLE_KEY)
2. ✅ **Payment verification** before allowing mint
3. ✅ **Amount validation** server-side based on phrase count
4. ✅ **Wallet address validation**
5. ✅ **Payment tracking** in Supabase for reconciliation
6. ✅ **No contract changes** - reduces attack surface

---

## **Migration Notes from RainbowKit to OnchainConnect**

- Remove `@rainbow-me/rainbowkit` dependency
- Remove RainbowKit provider from layout
- Replace with OnchainConnect provider
- Update wallet connection logic to use Privy
- Test wallet connections work correctly

---

## **Farcaster Miniapp Integration**

### **Detecting Farcaster Context**

Create `hooks/useFarcasterContext.ts`:

```typescript
'use client';

import { useEffect, useState } from 'react';

interface FarcasterContext {
  isFarcaster: boolean;
  fid: number | null;
  username: string | null;
}

export function useFarcasterContext(): FarcasterContext {
  const [context, setContext] = useState<FarcasterContext>({
    isFarcaster: false,
    fid: null,
    username: null,
  });

  useEffect(() => {
    // Check if running in Farcaster context
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const fid = searchParams.get('fid');
      const username = searchParams.get('username');

      // Farcaster frames pass context via URL params or window object
      const isFarcaster = !!fid || !!(window as any).farcaster;

      setContext({
        isFarcaster,
        fid: fid ? parseInt(fid) : null,
        username: username || null,
      });
    }
  }, []);

  return context;
}
```

### **Update Payment Hook for Farcaster**

Modify `hooks/useX402Payment.ts` to include Farcaster data:

```typescript
const verifyPayment = async (
  phraseCount: number,
  phrases: string[],
  walletAddress: string,
  farcasterContext?: { fid: number | null; username: string | null }
) => {
  setIsVerifying(true);
  try {
    const amounts = { 1: '0.20', 2: '0.40', 3: '0.30' };
    const amount = amounts[phraseCount as keyof typeof amounts];

    const paymentHeader = await generatePaymentHeader({
      amount,
      token: 'USDC',
      recipient: process.env.NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS!,
    });

    // Determine source platform
    const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';

    const response = await fetch('/api/x402/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentHeader,
        phraseCount,
        phrases,
        walletAddress,
        farcasterFid: farcasterContext?.fid,
        farcasterUsername: farcasterContext?.username,
        sourcePlatform,
      }),
    });

    // ... rest of the function
  } finally {
    setIsVerifying(false);
  }
};
```

### **Update CustomMint Component**

Add Farcaster context to CustomMint:

```typescript
import { useFarcasterContext } from '@/hooks/useFarcasterContext';

export function CustomMint({ ... }: CustomMintProps) {
  const farcasterContext = useFarcasterContext();
  // ... existing code ...

  const handlePayAndMint = async () => {
    // ... existing validation ...

    try {
      const { paymentId, paymentHeader } = await verifyPayment(
        phraseCount,
        activePhrases,
        walletAddress,
        farcasterContext // Pass Farcaster context
      );

      onMint(paymentId, paymentHeader);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Payment verification failed');
    }
  };

  // ... rest of component ...
}
```

### **Farcaster Frame Metadata** (Optional)

Create `app/api/frame/route.ts` for Farcaster Frame support:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const frameMetadata = {
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_APP_URL}/og_600x400.webp`,
    buttons: [
      {
        label: 'Mint NFT',
        action: 'link',
        target: process.env.NEXT_PUBLIC_APP_URL,
      },
    ],
  };

  return NextResponse.json(frameMetadata);
}
```

### **Tracking Benefits**

With Farcaster integration, you can:

1. **Track user behavior** by FID across sessions
2. **Build leaderboards** of top Farcaster minters
3. **Reward active users** with airdrops or discounts
4. **Analyze platform performance** (web vs. Farcaster miniapp)
5. **Target marketing** to specific Farcaster users
6. **Social proof** - show "X Farcaster users have minted"

### **Example Queries**

```sql
-- Top Farcaster minters
SELECT farcaster_username, COUNT(*) as mint_count, SUM(amount_usdc) as total_spent
FROM payment_transactions
WHERE farcaster_fid IS NOT NULL AND mint_status = 'minted'
GROUP BY farcaster_username
ORDER BY mint_count DESC
LIMIT 10;

-- Platform distribution
SELECT source_platform, COUNT(*) as count
FROM payment_transactions
GROUP BY source_platform;

-- Success rate by platform
SELECT
  source_platform,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE mint_status = 'minted') as successful,
  ROUND(100.0 * COUNT(*) FILTER (WHERE mint_status = 'minted') / COUNT(*), 2) as success_rate
FROM payment_transactions
GROUP BY source_platform;
```

---

## **Next Steps**

1. ✅ Install dependencies (`@onchainfi/connect`, `@supabase/supabase-js`)
2. ✅ Setup Supabase project + create `payment_transactions` table
3. ✅ Get Onchain.fi API key (https://onchain.fi/get-api-key)
4. ✅ Get Privy App ID (https://privy.io)
5. ✅ Add all environment variables to `.env.local`
6. ✅ Create backend API routes (verify, settle, update-mint-status, history, farcaster-stats)
7. ✅ Create frontend components (PhraseSelector, updated CustomMint)
8. ✅ Create hooks (useX402Payment, useFarcasterContext)
9. ✅ Update layout with OnchainConnect
10. ✅ Test payment flow on Base Sepolia
11. ✅ Test Farcaster miniapp integration
12. ✅ Deploy to production

---

**Status**: Documentation Complete ✅
**Ready to implement**: Yes
**Estimated effort**: 1-2 days implementation
**Contract changes**: None required ✅
**Farcaster support**: Full tracking with FID and username ✅
