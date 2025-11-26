"use client";

import { useEffect, useRef, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { useFarcasterContext } from "@/hooks/useFarcasterContext";
import { HomeContent } from "@/components/HomeContent";

const SHARE_TEXT = "What is Base means for you?";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";

/**
 * MiniAppScreen - Wrapper for MiniApp mode
 * - Fires sdk.ready() after hydration
 * - Uses sdk.actions.composeCast() for Farcaster sharing
 * - Uses sdk.actions.openUrl() for external links (keeps user in Farcaster)
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

  // Handle Farcaster share using SDK composeCast
  const handleFarcasterShare = useCallback(async () => {
    try {
      const result = await sdk.actions.composeCast({
        text: SHARE_TEXT,
        embeds: [APP_URL],
      });

      if (result?.cast) {
        console.log("[MiniApp] Cast posted:", result.cast.hash);
      } else {
        console.log("[MiniApp] User cancelled cast");
      }
    } catch (error) {
      console.error("[MiniApp] composeCast error:", error);
    }
  }, []);

  // Handle external URL opening using SDK openUrl
  // This keeps the user inside Farcaster instead of leaving the app
  const handleOpenUrl = useCallback(async (url: string) => {
    try {
      await sdk.actions.openUrl(url);
      console.log("[MiniApp] Opened URL:", url);
    } catch (error) {
      console.error("[MiniApp] openUrl error:", error);
      // Fallback to window.open if SDK fails
      window.open(url, "_blank");
    }
  }, []);

  return (
    <HomeContent
      isMiniApp
      onFarcasterShare={handleFarcasterShare}
      onOpenUrl={handleOpenUrl}
      logPrefix="[MiniApp]"
    />
  );
}
