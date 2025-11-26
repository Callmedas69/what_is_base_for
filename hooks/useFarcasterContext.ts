'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import type { FarcasterContext } from '@/types/x402';

/**
 * Hook to detect and extract Farcaster miniapp context
 * Uses official SDK for proper Mini App integration
 */
export function useFarcasterContext(): FarcasterContext & { isReady: boolean } {
  const [context, setContext] = useState<FarcasterContext & { isReady: boolean }>({
    isFarcaster: false,
    fid: null,
    username: null,
    isReady: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initFarcaster = async () => {
      try {
        // Check if running inside Farcaster client (iframe detection)
        const isInFrame = window.self !== window.top ||
                          window.location.ancestorOrigins?.length > 0 ||
                          (window as unknown as { farcaster?: unknown }).farcaster !== undefined;

        if (!isInFrame) {
          // Not in Farcaster - regular web context
          setContext({
            isFarcaster: false,
            fid: null,
            username: null,
            isReady: true,
          });
          return;
        }

        // Get context from SDK (it's a Promise)
        const sdkContext = await sdk.context;

        if (sdkContext?.user) {
          setContext({
            isFarcaster: true,
            fid: sdkContext.user.fid ?? null,
            username: sdkContext.user.username ?? null,
            isReady: true,
          });
          console.log('[Farcaster] Context loaded:', {
            fid: sdkContext.user.fid,
            username: sdkContext.user.username,
          });
        } else {
          // In iframe but no SDK context - might be preview or other embed
          setContext({
            isFarcaster: true,
            fid: null,
            username: null,
            isReady: true,
          });
          console.log('[Farcaster] In iframe (no user context)');
        }
      } catch (error) {
        console.error('[Farcaster] Error initializing:', error);
        setContext({
          isFarcaster: false,
          fid: null,
          username: null,
          isReady: true,
        });
      }
    };

    initFarcaster();
  }, []);

  return context;
}
