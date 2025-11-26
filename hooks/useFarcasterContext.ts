'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import type { FarcasterContext } from '@/types/x402';

/**
 * Hook to detect and extract Farcaster miniapp context
 * Uses official SDK isInMiniApp() for reliable detection
 */
export function useFarcasterContext(): FarcasterContext & { isReady: boolean } {
  const [context, setContext] = useState<FarcasterContext & { isReady: boolean }>({
    isFarcaster: false,
    fid: null,
    username: null,
    isReady: false,
  });

  useEffect(() => {
    async function init() {
      try {
        // Use official SDK detection method
        const inMiniApp = await sdk.isInMiniApp();

        if (!inMiniApp) {
          // Not in Farcaster - regular web context
          setContext({
            isFarcaster: false,
            fid: null,
            username: null,
            isReady: true,
          });
          return;
        }

        // Get context from SDK
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
          // In MiniApp but no user context - preview mode
          setContext({
            isFarcaster: true,
            fid: null,
            username: null,
            isReady: true,
          });
          console.log('[Farcaster] In MiniApp (no user context)');
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
    }

    init();
  }, []);

  return context;
}
