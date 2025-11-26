"use client";

import { ReactNode } from "react";
import { FarcasterProvider } from "./FarcasterProvider";
import { OnchainConnect } from "@onchainfi/connect";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { AudioProvider } from "@/hooks/useAudio";
import { CHAIN_CONFIG, APP_CONFIG } from "@/lib/config";
import { base, baseSepolia } from "wagmi/chains";

// Map chainId to wagmi chain object
const CHAIN_MAP = {
  8453: base,
  84532: baseSepolia,
} as const;

/**
 * MiniAppClientProviders - Provider chain for Farcaster MiniApp mode
 * Wraps with FarcasterProvider for proper SDK initialization
 */
export function MiniAppClientProviders({ children }: { children: ReactNode }) {
  const chain = CHAIN_MAP[CHAIN_CONFIG.CHAIN_ID as keyof typeof CHAIN_MAP] || baseSepolia;

  return (
    <FarcasterProvider>
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
    </FarcasterProvider>
  );
}
