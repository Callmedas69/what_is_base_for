"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import type {
  FarcasterContextValue,
  FarcasterUser,
  FarcasterClient,
  ComposeCastResult,
} from "@/types/farcaster";
import { defaultFarcasterContext } from "@/types/farcaster";

/**
 * Farcaster Context
 *
 * Global context for Farcaster MiniApp SDK.
 * Provides unified access to:
 * - Detection state (isFarcaster, isReady)
 * - User info (fid, username, displayName, pfpUrl)
 * - Client info (safeAreaInsets)
 * - Actions (composeCast, openUrl, ready)
 */
const FarcasterContext = createContext<FarcasterContextValue>(defaultFarcasterContext);

interface FarcasterMiniAppProviderProps {
  children: ReactNode;
}

/**
 * FarcasterMiniAppProvider
 *
 * Wrap your app with this provider at the root level (layout.tsx).
 * It initializes the Farcaster SDK once and provides context to all children.
 *
 * Features:
 * - Single SDK initialization
 * - Persistent state across modals and navigation
 * - Fallback actions for web mode
 * - Type-safe context access via useFarcaster() hook
 */
export function FarcasterMiniAppProvider({ children }: FarcasterMiniAppProviderProps) {
  const [isFarcaster, setIsFarcaster] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [client, setClient] = useState<FarcasterClient | null>(null);
  const readySent = useRef(false);

  // Initialize SDK on mount
  useEffect(() => {
    async function initFarcaster() {
      try {
        // Check if we're inside a Farcaster MiniApp
        const inMiniApp = await sdk.isInMiniApp();

        if (!inMiniApp) {
          // Web mode - no Farcaster context
          setIsFarcaster(false);
          setIsReady(true);
          console.log("[Farcaster] Web mode detected");
          return;
        }

        // MiniApp mode - get context
        setIsFarcaster(true);

        const context = await sdk.context;

        if (context?.user) {
          setUser({
            fid: context.user.fid ?? null,
            username: context.user.username ?? null,
            displayName: context.user.displayName ?? null,
            pfpUrl: context.user.pfpUrl ?? null,
          });
          console.log("[Farcaster] User context loaded:", {
            fid: context.user.fid,
            username: context.user.username,
          });
        }

        if (context?.client) {
          setClient({
            safeAreaInsets: context.client.safeAreaInsets ?? {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          });
        }

        setIsReady(true);
        console.log("[Farcaster] MiniApp context ready");
      } catch (error) {
        console.error("[Farcaster] Init error:", error);
        setIsFarcaster(false);
        setIsReady(true);
      }
    }

    initFarcaster();
  }, []);

  /**
   * Compose a cast using Farcaster SDK or fallback to URL
   */
  const composeCast = useCallback(
    async (text: string, embeds?: string[]): Promise<ComposeCastResult> => {
      if (isFarcaster && isReady) {
        try {
          // SDK expects specific tuple types for embeds
          const embedsParam = embeds?.length
            ? (embeds.slice(0, 2) as [] | [string] | [string, string])
            : undefined;

          const result = await sdk.actions.composeCast({
            text,
            embeds: embedsParam,
          });

          if (result?.cast) {
            console.log("[Farcaster] Cast posted:", result.cast.hash);
            return { success: true, hash: result.cast.hash };
          }

          console.log("[Farcaster] User cancelled cast");
          return { success: false };
        } catch (error) {
          console.error("[Farcaster] composeCast error:", error);
          return { success: false };
        }
      }

      // Web fallback - open Warpcast compose URL
      const embedParams = embeds?.map((e) => `embeds[]=${encodeURIComponent(e)}`).join("&") || "";
      const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}${embedParams ? `&${embedParams}` : ""}`;
      window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
      return { success: true };
    },
    [isFarcaster, isReady]
  );

  /**
   * Open a URL using Farcaster SDK or fallback to window.open
   */
  const openUrl = useCallback(
    async (url: string): Promise<void> => {
      if (isFarcaster && isReady) {
        try {
          await sdk.actions.openUrl(url);
          console.log("[Farcaster] Opened URL:", url);
          return;
        } catch (error) {
          console.error("[Farcaster] openUrl error:", error);
          // Fall through to web fallback
        }
      }

      // Web fallback
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [isFarcaster, isReady]
  );

  /**
   * Signal that the app is ready (removes Warpcast splash screen)
   * Safe to call multiple times - only executes once
   */
  const ready = useCallback(() => {
    // Guard: only call if in MiniApp, ready, and not already sent
    if (!readySent.current && isFarcaster && isReady) {
      readySent.current = true;
      sdk.actions.ready();
      console.log("[Farcaster] ready() called - splash removed");
    }
  }, [isFarcaster, isReady]);

  // Memoize actions object to prevent unnecessary re-renders
  const actions = useMemo(
    () => ({
      composeCast,
      openUrl,
      ready,
    }),
    [composeCast, openUrl, ready]
  );

  // Memoize entire context value for performance
  const value = useMemo<FarcasterContextValue>(
    () => ({
      isFarcaster,
      isReady,
      user,
      client,
      actions,
    }),
    [isFarcaster, isReady, user, client, actions]
  );

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}

/**
 * useFarcaster Hook
 *
 * Access the Farcaster context from any component.
 *
 * @example
 * ```tsx
 * const { isFarcaster, isReady, user, actions } = useFarcaster();
 *
 * // Check if in MiniApp
 * if (isFarcaster && isReady) {
 *   // Use SDK actions
 *   await actions.composeCast("Hello!", ["https://example.com"]);
 * }
 * ```
 */
export function useFarcaster(): FarcasterContextValue {
  const context = useContext(FarcasterContext);

  if (context === undefined) {
    throw new Error("useFarcaster must be used within a FarcasterMiniAppProvider");
  }

  return context;
}
