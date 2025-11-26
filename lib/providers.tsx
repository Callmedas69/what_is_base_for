"use client";

/**
 * Client-side Providers
 * Wraps the app with OnchainConnect (Privy + Wagmi + Onchain payments)
 * Chain is dynamically selected based on CHAIN_CONFIG.CHAIN_ID
 */

import { OnchainConnect } from "@onchainfi/connect";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { base, baseSepolia } from "wagmi/chains";
import { CHAIN_CONFIG, APP_CONFIG } from "@/lib/config";
import { AudioProvider } from "@/hooks/useAudio";

// Map chainId to wagmi chain object
const CHAIN_MAP = {
  8453: base,
  84532: baseSepolia,
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const chain = CHAIN_MAP[CHAIN_CONFIG.CHAIN_ID as keyof typeof CHAIN_MAP] || baseSepolia;

  return (
    <OnchainConnect
      privyAppId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      onchainApiKey={process.env.NEXT_PUBLIC_API_KEY!}
      chains={[chain]}
      defaultChain={chain}
      appearance={{
        theme: "light",
        accentColor: "#0000ff",
        landingHeader: `Connect to ${APP_CONFIG.NAME}`,
        showWalletLoginFirst: true,
      }}
      // Wallet only - no social login needed
      // Follow/Recast validation done via Neynar API
      privyConfig={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#0000ff',
          landingHeader: `Connect to ${APP_CONFIG.NAME}`,
          showWalletLoginFirst: true,
        },
      }}
    >
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || '',
          defaultTheme: Theme.Light,
        }}
      >
        <AudioProvider>
          {children}
        </AudioProvider>
      </NeynarContextProvider>
    </OnchainConnect>
  );
}
