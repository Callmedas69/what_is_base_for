'use client';

import { useState } from 'react';
import { PAYMENT_CONFIG } from '@/lib/config';
import type {
  UseX402PaymentResult,
  PhraseCount,
  FarcasterContext,
  MintStatus,
  PaymentVerifyResponse,
  PaymentSettleResponse,
  UpdateMintStatusResponse,
} from '@/types/x402';

/**
 * X402 Payment Hook
 * Handles payment verification, settlement, and status updates with Onchain.fi
 * Includes Farcaster miniapp support
 */
export function useX402Payment(): UseX402PaymentResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Verify payment with Onchain.fi before minting
   */
  const verifyPayment = async (
    phraseCount: PhraseCount,
    phrases: string[],
    walletAddress: string,
    farcasterContext?: FarcasterContext
  ) => {
    setIsVerifying(true);
    try {
      // Get expected amount
      const amount = PAYMENT_CONFIG.PRICES[phraseCount];

      console.log('[useX402Payment] Verifying payment:', {
        phraseCount,
        amount,
        phrasesCount: phrases.length,
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        hasFarcasterContext: !!farcasterContext?.fid,
      });

      // TODO: Integrate actual OnchainConnect SDK payment header generation
      // For now, the verification endpoint will handle payment header generation
      const paymentHeader = 'PENDING_INTEGRATION';

      // Determine source platform
      const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';

      // Call verification API
      const response = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentHeader,
          phraseCount,
          phrases,
          walletAddress: walletAddress.toLowerCase(),
          farcasterFid: farcasterContext?.fid || undefined,
          farcasterUsername: farcasterContext?.username || undefined,
          sourcePlatform,
        }),
      });

      const data: PaymentVerifyResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Payment verification failed');
      }

      console.log('[useX402Payment] Payment verified:', data.paymentId);

      return {
        paymentId: data.paymentId,
        transactionId: data.transactionId,
        paymentHeader,
      };
    } catch (error) {
      console.error('[useX402Payment] Verification error:', error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Settle payment after successful mint
   */
  const settlePayment = async (
    paymentId: string,
    paymentHeader: string,
    tokenId: bigint,
    txHash: string
  ) => {
    setIsSettling(true);
    try {
      console.log('[useX402Payment] Settling payment:', {
        paymentId,
        tokenId: tokenId.toString(),
        txHash: `${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      const response = await fetch('/api/x402/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          paymentHeader,
          tokenId: tokenId.toString(),
          txHash,
          mintStatus: 'minted',
        }),
      });

      const data: PaymentSettleResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Payment settlement failed');
      }

      console.log('[useX402Payment] Payment settled successfully');
    } catch (error) {
      console.error('[useX402Payment] Settlement error:', error);
      throw error;
    } finally {
      setIsSettling(false);
    }
  };

  /**
   * Update mint status during the minting process
   */
  const updateMintStatus = async (
    paymentId: string,
    mintStatus: MintStatus,
    errorMessage?: string,
    errorCode?: string
  ) => {
    setIsUpdating(true);
    try {
      console.log('[useX402Payment] Updating mint status:', {
        paymentId,
        mintStatus,
        hasError: !!errorMessage,
      });

      const response = await fetch('/api/x402/update-mint-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          mintStatus,
          errorMessage,
          errorCode,
        }),
      });

      const data: UpdateMintStatusResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to update mint status');
      }

      console.log('[useX402Payment] Mint status updated successfully');
    } catch (error) {
      console.error('[useX402Payment] Update status error:', error);
      // Don't throw - this is a non-critical update
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    verifyPayment,
    settlePayment,
    updateMintStatus,
    isVerifying,
    isSettling,
    isUpdating,
  };
}
