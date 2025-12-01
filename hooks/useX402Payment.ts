'use client';

import { useState } from 'react';
import { useOnchainPay, useOnchainWallet } from '@onchainfi/connect';
import { PAYMENT_CONFIG } from '@/lib/config';
import type {
  UseX402PaymentResult,
  PhraseCount,
  FarcasterContext,
  MintStatus,
  PaymentVerifyResponse,
  UpdateMintStatusResponse,
} from '@/types/x402';

/**
 * X402 Payment Hook
 * Handles payment with Onchain.fi SDK using one-step pay() method
 * Includes Farcaster miniapp support
 *
 * Payment flow for custom mint:
 * 1. verifyPayment() - SDK pay() (user signs + funds transfer in one step)
 * 2. settlePayment() - Just updates DB status (SDK already settled via pay())
 * 3. mint() - On-chain NFT mint
 * 4. recordMintSuccess() - Update DB with tokenId + txHash
 */
export function useX402Payment(): UseX402PaymentResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get login function for Privy auth prompt (when external wallet auto-connects without Privy session)
  const { login } = useOnchainWallet();

  // Use OnchainConnect SDK - pay() handles verify + settle in one step
  const { pay } = useOnchainPay({
    callbacks: {
      onSigningStart: () => console.log('[useX402Payment] Opening wallet for signing...'),
      onSigningComplete: () => console.log('[useX402Payment] Signed!'),
      onVerificationStart: () => console.log('[useX402Payment] Verifying payment...'),
      onVerificationComplete: () => console.log('[useX402Payment] Payment verified!'),
      onSettlementStart: () => console.log('[useX402Payment] Settling payment...'),
      onSettlementComplete: () => console.log('[useX402Payment] Payment settled!'),
    },
  });

  /**
   * Process payment with Onchain.fi using one-step pay()
   * This handles both authorization AND fund transfer
   */
  const verifyPayment = async (
    phraseCount: PhraseCount,
    phrases: string[],
    walletAddress: string,
    farcasterContext?: FarcasterContext
  ) => {
    setIsVerifying(true);
    try {
      const amount = PAYMENT_CONFIG.PRICES[phraseCount];

      console.log('[useX402Payment] Processing payment:', {
        phraseCount,
        amount,
        phrasesCount: phrases.length,
        walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        hasFarcasterContext: !!farcasterContext?.fid,
      });

      // Use one-step pay() - handles verify + settle together
      const payResult = await pay({
        to: PAYMENT_CONFIG.RECIPIENT,
        amount,
      });

      console.log('[useX402Payment] SDK pay result:', payResult);

      if (!payResult.success) {
        console.error('[useX402Payment] Payment failed:', payResult.error || payResult);
        throw new Error(payResult.error || 'Payment failed');
      }

      // Generate paymentId from txHash or timestamp
      const paymentId = payResult.txHash || `pay_${Date.now()}`;
      const paymentHeader = payResult.txHash || '';

      console.log('[useX402Payment] Payment successful, txHash:', payResult.txHash);

      // Determine source platform
      const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';

      // Store payment details in Supabase
      const response = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
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
        // Payment already went through, just log the DB error
        console.error('[useX402Payment] Failed to store payment in DB:', (data as any).error);
      }

      console.log('[useX402Payment] Payment complete:', paymentId);

      return {
        paymentId,
        transactionId: data?.transactionId || paymentId,
        paymentHeader,
      };
    } catch (error) {
      console.error('[useX402Payment] Payment error:', error);

      // Detect Privy auth error - wallet auto-connected without Privy session
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('No embedded or connected wallet')) {
        console.log('[useX402Payment] Wallet not authenticated through Privy, prompting login');
        login(); // Open Privy modal for user to authenticate
        throw new Error('Please connect your wallet to enable payments');
      }

      // Store failed payment in Supabase for tracking
      try {
        const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';
        await fetch('/api/x402/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: `failed_${Date.now()}`,
            paymentHeader: '',
            phraseCount,
            phrases,
            walletAddress: walletAddress.toLowerCase(),
            farcasterFid: farcasterContext?.fid,
            farcasterUsername: farcasterContext?.username,
            sourcePlatform,
            paymentStatus: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          }),
        });
        console.log('[useX402Payment] Failed payment stored for tracking');
      } catch (dbError) {
        console.error('[useX402Payment] Failed to store failed payment:', dbError);
      }

      throw error;
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Settlement confirmation (logging only)
   * SDK pay() already handles settlement - this is just for debugging
   */
  const settlePayment = async (
    paymentId: string,
    _paymentHeader: string
  ) => {
    setIsSettling(true);
    try {
      // SDK pay() already handles settlement - this is just for logging
      console.log('[useX402Payment] Settlement confirmed (handled by SDK pay()):', { paymentId });
    } finally {
      setIsSettling(false);
    }
  };

  /**
   * Record successful mint in database
   * Called after on-chain mint succeeds
   */
  const recordMintSuccess = async (
    paymentId: string,
    tokenId: bigint,
    txHash: string
  ) => {
    setIsUpdating(true);
    try {
      console.log('[useX402Payment] Recording mint success:', {
        paymentId,
        tokenId: tokenId.toString(),
        txHash: `${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      const response = await fetch('/api/x402/update-mint-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          mintStatus: 'minted',
          tokenId: tokenId.toString(),
          txHash,
        }),
      });

      const data: UpdateMintStatusResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Failed to record mint success');
      }

      console.log('[useX402Payment] Mint success recorded');
    } catch (error) {
      console.error('[useX402Payment] Record mint error:', error);
      // Don't throw - this is tracking, mint already succeeded
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update mint status: 'minted' (success) or 'failed' (can retry)
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
    recordMintSuccess,
    updateMintStatus,
    isVerifying,
    isSettling,
    isUpdating,
  };
}
