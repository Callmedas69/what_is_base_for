'use client';

import { NeynarAuthButton, SIWN_variant } from '@neynar/react';
import { useFarcasterGate } from '@/hooks/useFarcasterGate';

interface FarcasterGateProps {
  children: React.ReactNode;
}

/**
 * Farcaster Follow Gate Component
 * Blocks free mint until user follows target account
 * Shows Link Farcaster button for website, auto-detects for miniapp
 */
export function FarcasterGate({ children }: FarcasterGateProps) {
  const {
    isLinked,
    isFollowing,
    isEligible,
    isLoading,
    isChecking,
    username,
    targetUsername,
    isMiniapp,
    needsLink,
    isGateEnabled,
    refreshStatus,
    error,
  } = useFarcasterGate();

  // Gate disabled - show children directly
  if (!isGateEnabled) {
    return <>{children}</>;
  }

  // Loading state  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <h3 className="text-lg font-semibold text-[#0a0b0d] uppercase">
            FREE MINT
          </h3>
        </div>
        <div className="flex text-sm items-center justify-center py-4 text-[#5b616e]">
          Checking eligibility...
        </div>
      </div>
    );
  }

  // Website: Not linked - show Link Farcaster button
  if (needsLink) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <h3 className="text-lg font-semibold text-[#0a0b0d] uppercase">
            FREE MINT
          </h3>
          
        </div>
        <div>
          <NeynarAuthButton variant={SIWN_variant.FARCASTER} label="Follow @geoart to mint free"  className='flex items-center justify-center text-xs italic !text-white rounded-lg !bg-[#855dcd] px-4 py-2 cursor-pointer' />
        </div>
      </div>
    );
  }

  // Linked but not following
  if (isLinked && !isFollowing) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <h3 className="text-lg font-semibold text-[#0a0b0d] uppercase">
            FREE MINT
          </h3>
          
        </div>
        <p className="text-sm text-[#5b616e]">
          Hello!! {username && <><span className="font-medium text-[#0a0b0d]">@{username}</span></>}
          
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={`https://warpcast.com/${targetUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
          >
            Follow @geoart
          </a>
          <button
            onClick={refreshStatus}
            disabled={isChecking}
            className="inline-flex items-center justify-center rounded-lg border border-[#eef0f3] bg-white px-4 py-2.5 text-sm font-medium text-[#0a0b0d] transition-colors hover:bg-[#f9fafb] disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'verify'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  // Eligible - show children (the mint button)
  if (isEligible) {
    return (
      <div className="space-y-3">
        {username && (
          <div className="flex items-center gap-2 text-sm text-[#5b616e]">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Following @{targetUsername}
            </span>
            <span className="text-[#9ca3af]">|</span>
            <span className="font-medium text-[#0a0b0d]">@{username}</span>
          </div>
        )}
        {children}
      </div>
    );
  }

  // Miniapp but no FID (shouldn't happen normally)
  if (isMiniapp && !isLinked) {
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <h3 className="text-lg font-semibold text-[#0a0b0d] uppercase">
            FREE MINT
          </h3>
          
        </div>
        <p className="text-sm text-[#5b616e]">
          Unable to detect Farcaster account. Please try again.
        </p>
      </div>
    );
  }

  // Fallback
  return <>{children}</>;
}
