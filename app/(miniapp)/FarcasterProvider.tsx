"use client";

import { useState, useEffect, ReactNode } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * FarcasterProvider - Wraps MiniApp with proper SDK initialization
 * Ensures SDK context is ready before rendering children
 */
export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      // Wait for SDK to confirm we're in MiniApp
      await sdk.isInMiniApp();
      setReady(true);
    }
    init();
  }, []);

  // Don't render until SDK is initialized
  if (!ready) return null;

  return <>{children}</>;
}
