"use client";

import { useEffect, useCallback } from "react";
import { useFarcaster } from "@/contexts/FarcasterContext";
import { HomeContent } from "@/components/HomeContent";
import { APP_CONFIG } from "@/lib/config";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";

/**
 * MiniAppScreen - Wrapper for MiniApp mode
 *
 * Uses unified FarcasterContext for:
 * - sdk.ready() via actions.ready()
 * - sdk.actions.composeCast() via actions.composeCast()
 * - sdk.actions.openUrl() via actions.openUrl()
 */
export default function MiniAppScreen() {
  const { isFarcaster, isReady, actions } = useFarcaster();

  // CRITICAL: Fire sdk.ready() AFTER hydration is complete
  useEffect(() => {
    if (isReady && isFarcaster) {
      actions.ready();
    }
  }, [isReady, isFarcaster, actions]);

  // Handle Farcaster share using context action
  const handleFarcasterShare = useCallback(async () => {
    await actions.composeCast(APP_CONFIG.SHARE_TEXT, [APP_URL]);
  }, [actions]);

  // Handle external URL opening using context action
  const handleOpenUrl = useCallback(
    async (url: string) => {
      await actions.openUrl(url);
    },
    [actions]
  );

  return (
    <HomeContent
      isMiniApp
      onFarcasterShare={handleFarcasterShare}
      onOpenUrl={handleOpenUrl}
      logPrefix="[MiniApp]"
    />
  );
}
