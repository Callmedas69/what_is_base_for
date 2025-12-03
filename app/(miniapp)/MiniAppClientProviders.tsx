"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { Toaster } from "sonner";
import { AudioProvider } from "@/hooks/useAudio";
import { wagmiConfig } from "@/lib/wagmi";

// Create a stable query client instance
const queryClient = new QueryClient();

/**
 * MiniAppClientProviders - Provider chain for Farcaster MiniApp mode
 *
 * Architecture:
 * - WagmiProvider: Required for x402 payment signing (useSignTypedData)
 * - FarcasterContext: Wallet is handled at root level (layout.tsx)
 * - x402 payments: Use Farcaster wallet provider directly (via viem)
 *
 * Note: Wallet connection in MiniApp uses FarcasterContext (embedded wallet),
 * WagmiProvider is only for wagmi hooks compatibility in payment flow.
 */
export function MiniAppClientProviders({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}
