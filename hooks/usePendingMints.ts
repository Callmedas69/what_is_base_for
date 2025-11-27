'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Pending mint data returned from API
 */
export interface PendingMint {
  paymentId: string;
  transactionId: string;
  phrases: string[];
  phraseCount: number;
  amountUsdc: string;
  failedAt: string;
  errorMessage?: string;
  errorCode?: string;
  createdAt: string;
}

interface UsePendingMintsResult {
  pendingMints: PendingMint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch pending mints for a wallet
 *
 * Pending mints are payments that were settled but mint failed.
 * Users can retry these mints without re-paying.
 */
export function usePendingMints(walletAddress?: string): UsePendingMintsResult {
  const [pendingMints, setPendingMints] = useState<PendingMint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingMints = useCallback(async () => {
    if (!walletAddress) {
      setPendingMints([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/x402/pending-mints?wallet=${walletAddress}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pending mints');
      }

      setPendingMints(data.pendingMints || []);
    } catch (err) {
      console.error('[usePendingMints] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending mints');
      setPendingMints([]);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Fetch on mount and when wallet changes
  useEffect(() => {
    fetchPendingMints();
  }, [fetchPendingMints]);

  return {
    pendingMints,
    isLoading,
    error,
    refetch: fetchPendingMints,
  };
}
