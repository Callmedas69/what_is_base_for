'use client';

import { useState } from 'react';
import type { PendingMint } from '@/hooks/usePendingMints';

interface PendingMintsBannerProps {
  pendingMints: PendingMint[];
  isRetrying: boolean;
  onRetry: (pendingMint: PendingMint) => void;
}

/**
 * Banner showing pending (failed) mints that can be retried
 *
 * Displays when user has paid but mint failed.
 * Allows retry without re-payment.
 */
export function PendingMintsBanner({
  pendingMints,
  isRetrying,
  onRetry,
}: PendingMintsBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (pendingMints.length === 0) {
    return null;
  }

  const firstMint = pendingMints[0];
  const hasMultiple = pendingMints.length > 1;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-amber-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {pendingMints.length} paid mint{pendingMints.length > 1 ? 's' : ''} failed
            </p>
            <p className="text-xs text-amber-600">
              Payment was successful. Retry mint to get your NFT.
            </p>
          </div>
        </div>

        {hasMultiple && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-amber-700 underline hover:text-amber-900"
          >
            {expanded ? 'Show less' : `Show all (${pendingMints.length})`}
          </button>
        )}
      </div>

      {/* First/Selected Mint Details */}
      {!expanded && (
        <div className="flex items-center justify-between gap-4 rounded-md bg-white p-3 border border-amber-200">
          <div className="text-sm">
            <p className="text-[#0a0b0d] font-medium">
              {firstMint.phraseCount} phrase{firstMint.phraseCount > 1 ? 's' : ''} • {firstMint.amountUsdc} USDC
            </p>
            <p className="text-xs text-[#5b616e] truncate max-w-[200px]">
              {firstMint.phrases.map(p => p.replace(/[{}]/g, '')).join(', ')}
            </p>
          </div>
          <button
            onClick={() => onRetry(firstMint)}
            disabled={isRetrying}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? 'Retrying...' : 'Retry Mint'}
          </button>
        </div>
      )}

      {/* Expanded List */}
      {expanded && (
        <div className="space-y-2">
          {pendingMints.map((mint) => (
            <div
              key={mint.paymentId}
              className="flex items-center justify-between gap-4 rounded-md bg-white p-3 border border-amber-200"
            >
              <div className="text-sm">
                <p className="text-[#0a0b0d] font-medium">
                  {mint.phraseCount} phrase{mint.phraseCount > 1 ? 's' : ''} • {mint.amountUsdc} USDC
                </p>
                <p className="text-xs text-[#5b616e] truncate max-w-[200px]">
                  {mint.phrases.map(p => p.replace(/[{}]/g, '')).join(', ')}
                </p>
              </div>
              <button
                onClick={() => onRetry(mint)}
                disabled={isRetrying}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
