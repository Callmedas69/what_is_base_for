"use client";

/**
 * Client-side Providers
 *
 * Architecture (per official OnchainConnect docs):
 * - OnchainConnect: handles wallet (via Privy) + x402 payments
 * - useOnchainWallet(): wallet state (isConnected, address, login, logout)
 * - useOnchainPay(): x402 payment execution
 */

import { OnchainConnect } from "@onchainfi/connect";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { Toaster } from "sonner";
import { base } from "wagmi/chains";
import { AudioProvider } from "@/hooks/useAudio";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnchainConnect
      privyAppId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      onchainApiKey={process.env.NEXT_PUBLIC_API_KEY!}
      chains={[base]}
      defaultChain={base}
      loginMethods={['wallet']}
    >
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || '',
          defaultTheme: Theme.Light,
        }}
      >
        <AudioProvider>
          <Toaster position="top-center" richColors />
          {children}
        </AudioProvider>
      </NeynarContextProvider>
    </OnchainConnect>
  );
}
