"use client";

/**
 * Client-side Providers (Web Mode)
 *
 * Architecture:
 * - RainbowKit + Wagmi: Wallet connection
 * - x402 standalone client: Payments (via useX402Payment hook)
 *
 * Note: FarcasterContext (in layout.tsx) is for MiniApp mode only.
 * Web mode components should NOT use useFarcaster() for wallet state.
 */

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { Toaster } from "sonner";
import { AudioProvider } from "@/hooks/useAudio";
import { wagmiConfig } from "./wagmi";
import "@rainbow-me/rainbowkit/styles.css";

// Create a stable query client instance
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#0000ff",
            borderRadius: "medium",
          })}
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
