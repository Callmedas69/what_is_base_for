"use client";

import { useFarcaster } from "@/contexts/FarcasterContext";
import { Providers } from "@/lib/providers";
import { MiniAppClientProviders } from "./(miniapp)/MiniAppClientProviders";
import MiniAppScreen from "./(miniapp)/MiniAppScreen";
import WebScreen from "./(web)/WebScreen";

/**
 * Hybrid Page - Switches between Web and MiniApp modes
 *
 * Web Mode: Regular browser → Providers + WebScreen
 * MiniApp Mode: Farcaster Warpcast → MiniAppClientProviders + MiniAppScreen
 *
 * Context is provided globally by FarcasterMiniAppProvider in layout.tsx
 */
export default function Page() {
  const { isFarcaster, isReady } = useFarcaster();

  // Wait for detection to complete
  if (!isReady) return null;

  // MiniApp mode: Farcaster-specific providers + screen
  if (isFarcaster) {
    return (
      <MiniAppClientProviders>
        <MiniAppScreen />
      </MiniAppClientProviders>
    );
  }

  // Web mode: Standard providers + screen
  return (
    <Providers>
      <WebScreen />
    </Providers>
  );
}
