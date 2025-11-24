'use client';

import { useEffect, useState } from 'react';
import type { FarcasterContext } from '@/types/x402';

/**
 * Hook to detect and extract Farcaster miniapp context
 * Checks for FID and username from URL params or window object
 */
export function useFarcasterContext(): FarcasterContext {
  const [context, setContext] = useState<FarcasterContext>({
    isFarcaster: false,
    fid: null,
    username: null,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      // Method 1: Check URL parameters (Farcaster frames often pass context via URL)
      const searchParams = new URLSearchParams(window.location.search);
      const fidParam = searchParams.get('fid');
      const usernameParam = searchParams.get('username');

      // Method 2: Check window.farcaster object (Farcaster mobile app)
      const windowFarcaster = (window as any).farcaster;

      // Method 3: Check for Farcaster Frame context
      const frameContext = (window as any).fc;

      let fid: number | null = null;
      let username: string | null = null;
      let isFarcaster = false;

      // Parse FID from URL params
      if (fidParam) {
        const parsedFid = parseInt(fidParam, 10);
        if (!isNaN(parsedFid)) {
          fid = parsedFid;
          isFarcaster = true;
        }
      }

      // Parse username from URL params
      if (usernameParam) {
        username = usernameParam;
        isFarcaster = true;
      }

      // Check window.farcaster object
      if (windowFarcaster) {
        isFarcaster = true;
        if (windowFarcaster.fid && !fid) {
          fid = windowFarcaster.fid;
        }
        if (windowFarcaster.username && !username) {
          username = windowFarcaster.username;
        }
      }

      // Check Farcaster Frame context
      if (frameContext) {
        isFarcaster = true;
        if (frameContext.fid && !fid) {
          fid = frameContext.fid;
        }
        if (frameContext.username && !username) {
          username = frameContext.username;
        }
      }

      setContext({
        isFarcaster,
        fid,
        username,
      });

      // Log for debugging (remove in production)
      if (isFarcaster) {
        console.log('[Farcaster] Detected context:', { fid, username });
      }
    } catch (error) {
      console.error('[Farcaster] Error detecting context:', error);
      // Set safe defaults on error
      setContext({
        isFarcaster: false,
        fid: null,
        username: null,
      });
    }
  }, []);

  return context;
}
