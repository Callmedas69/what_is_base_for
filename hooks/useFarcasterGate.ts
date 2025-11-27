'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNeynarContext } from '@neynar/react';
import { useFarcaster } from '@/contexts/FarcasterContext';
import { FARCASTER_GATE_CONFIG } from '@/lib/config';

interface FarcasterGateState {
  fid: number | null;
  username: string | null;
  isLinked: boolean;
  source: 'miniapp' | 'siwn' | null;
  isFollowing: boolean;
  isEligible: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
}

/**
 * Unified hook for Farcaster follow gate
 * Supports both miniapp (Farcaster SDK) and website (Neynar SIWN) contexts
 */
export function useFarcasterGate() {
  // Miniapp context from unified Farcaster provider
  const { user, isFarcaster, isReady: miniappReady } = useFarcaster();
  const miniappFid = user?.fid ?? null;
  const miniappUsername = user?.username ?? null;

  // Website context from Neynar SIWN
  const { user: neynarUser } = useNeynarContext();

  const [state, setState] = useState<FarcasterGateState>({
    fid: null,
    username: null,
    isLinked: false,
    source: null,
    isFollowing: false,
    isEligible: false,
    isLoading: true,
    isChecking: false,
    error: null,
  });

  // Determine FID source (priority: miniapp > siwn)
  const effectiveFid = isFarcaster && miniappFid ? miniappFid : neynarUser?.fid ?? null;
  const effectiveUsername = isFarcaster && miniappUsername ? miniappUsername : neynarUser?.username ?? null;
  const effectiveSource: 'miniapp' | 'siwn' | null = isFarcaster && miniappFid ? 'miniapp' : neynarUser ? 'siwn' : null;

  // Check follow status when FID is available
  const checkFollowStatus = useCallback(async (fid: number) => {
    setState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const response = await fetch('/api/farcaster-gate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate follow status');
      }

      setState(prev => ({
        ...prev,
        isFollowing: data.isFollowing,
        isEligible: data.isEligible,
        isChecking: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('[FarcasterGate] Error checking follow:', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, []);

  // Update state when FID changes
  useEffect(() => {
    // Wait for miniapp to be ready if we're in Farcaster
    if (isFarcaster && !miniappReady) {
      return;
    }

    const isLinked = !!effectiveFid;

    setState(prev => ({
      ...prev,
      fid: effectiveFid,
      username: effectiveUsername,
      isLinked,
      source: effectiveSource,
      isLoading: isLinked, // If linked, we need to check follow status
    }));

    // Check follow status if FID is available
    if (effectiveFid) {
      checkFollowStatus(effectiveFid);
    } else {
      setState(prev => ({
        ...prev,
        isFollowing: false,
        isEligible: false,
        isLoading: false,
      }));
    }
  }, [effectiveFid, effectiveUsername, effectiveSource, isFarcaster, miniappReady, checkFollowStatus]);

  // Refresh follow status
  const refreshStatus = useCallback(() => {
    if (effectiveFid) {
      checkFollowStatus(effectiveFid);
    }
  }, [effectiveFid, checkFollowStatus]);

  return {
    ...state,
    // Config
    targetFid: FARCASTER_GATE_CONFIG.TARGET_FID,
    targetUsername: FARCASTER_GATE_CONFIG.TARGET_USERNAME,
    isGateEnabled: FARCASTER_GATE_CONFIG.ENABLED,
    // Actions
    refreshStatus,
    // Helpers
    isMiniapp: isFarcaster,
    needsLink: !state.isLinked && !isFarcaster, // Only show link option on website
  };
}
