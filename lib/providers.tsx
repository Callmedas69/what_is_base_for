"use client";

/**
 * Client-side Providers
 * Wraps the app with OnchainConnect (Privy + Wagmi + Onchain payments)
 */

import { OnchainConnect } from "@onchainfi/connect";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnchainConnect
      privyAppId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      onchainApiKey={process.env.NEXT_PUBLIC_ONCHAIN_API_KEY!}
    >
      {children}
    </OnchainConnect>
  );
}
