"use client";

import { useEffect, useRef } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcasterContext } from "@/hooks/useFarcasterContext";
import { HomeContent } from "@/components/HomeContent";

/**
 * MiniAppScreen - Wrapper for MiniApp mode
 * Fires sdk.ready() after hydration, then renders shared UI
 */
export default function MiniAppScreen() {
  const { isFarcaster, isReady } = useFarcasterContext();
  const sentReady = useRef(false);

  // CRITICAL: Fire sdk.ready() AFTER hydration is complete
  useEffect(() => {
    if (!isReady || !isFarcaster) return;

    if (!sentReady.current) {
      sentReady.current = true;
      sdk.actions.ready();
      console.log("[MiniApp] ready → Warpcast splash removed");
    }
  }, [isReady, isFarcaster]);

  return <HomeContent hideFarcasterShare logPrefix="[MiniApp]" />;
}
