"use client";

/**
 * Client-side Providers
 * Wraps the app with OnchainConnect (Privy + Wagmi + Onchain payments)
 * Chain is dynamically selected based on CHAIN_CONFIG.CHAIN_ID
 */

import { OnchainConnect } from "@onchainfi/connect";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { Toaster } from "sonner";
import { base } from "wagmi/chains";
import { CHAIN_CONFIG, APP_CONFIG, WALLETCONNECT_PROJECT_ID } from "@/lib/config";
import { AudioProvider } from "@/hooks/useAudio";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

// Map chainId to wagmi chain object (Base Mainnet only)
const CHAIN_MAP = {
  8453: base,
} as const;

export function Providers({ children }: { children: React.ReactNode }) {
  const chain = CHAIN_MAP[CHAIN_CONFIG.CHAIN_ID as keyof typeof CHAIN_MAP] || base;

  return (
    <OnchainConnect
      privyAppId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      onchainApiKey={process.env.NEXT_PUBLIC_API_KEY!}
      chains={[chain]}
      defaultChain={chain}
      connectors={[
        injected(),
        walletConnect({ projectId: WALLETCONNECT_PROJECT_ID }),
        coinbaseWallet({ appName: APP_CONFIG.NAME }),
      ]}
      appearance={{
        theme: "light",
        accentColor: "#0000ff",
        landingHeader: `Connect to ${APP_CONFIG.NAME}`,
        showWalletLoginFirst: true,
      }}

      loginMethods={['wallet']}
      // Wallet only - no social login needed
      // Follow/Recast validation done via Neynar API
      
      privyConfig={{
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
          <Toaster position="top-center" richColors />
          {children}
        </AudioProvider>
      </NeynarContextProvider>
    </OnchainConnect>
  );
}
