'use client';

import { useState } from 'react';
import { useOnchainPay } from '@onchainfi/connect';
import { PAYMENT_CONFIG, CURRENT_NETWORK } from '@/lib/config';

// Map config network names to API network names (Base Mainnet only)
const NETWORK_API_NAMES: Record<string, string> = {
  baseMainnet: 'base',
  base: 'base',
} as const;
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
 * Handles payment verification and status updates with Onchain.fi SDK
 * Includes Farcaster miniapp support
 *
 * Payment flow for custom mint:
 * 1. verifyPayment() - SDK verify + auto-settle (user signs, funds transfer)
 * 2. settlePayment() - Just updates DB status (SDK already settled)
 * 3. mint() - On-chain NFT mint
 * 4. recordMintSuccess() - Update DB with tokenId + txHash
 */
export function useX402Payment(): UseX402PaymentResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use OnchainConnect SDK - verify() auto-settles by default
  const { verify } = useOnchainPay();

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

      // Get API network name (e.g., "base" for Base Mainnet)
      const networkName = NETWORK_API_NAMES[CURRENT_NETWORK] || 'base';

      // Step 1: Use OnchainConnect SDK to verify payment
      // This prompts user to sign EIP-712 message and generates payment header
      const verifyResult = await verify({
        to: PAYMENT_CONFIG.RECIPIENT,
        amount,
        network: networkName,
        sourceNetwork: networkName,
        destinationNetwork: networkName,
      });

      console.log('[useX402Payment] SDK verify result:', verifyResult);
      console.log('[useX402Payment] SDK verify result FULL:', JSON.stringify(verifyResult, null, 2));
      console.log('[useX402Payment] x402Header from SDK:', verifyResult.x402Header);

      if (!verifyResult.success) {
        console.error('[useX402Payment] Verify failed:', verifyResult.error || verifyResult);
        throw new Error(verifyResult.error || 'Payment verification failed');
      }

      // Get paymentId and x402Header from SDK result
      const sdkPaymentId = verifyResult.paymentId;
      const paymentHeader = verifyResult.x402Header;

      // Validate SDK response
      if (!sdkPaymentId) {
        throw new Error('SDK did not return paymentId');
      }
      if (!paymentHeader) {
        throw new Error('SDK did not return x402Header');
      }

      console.log('[useX402Payment] SDK paymentId:', sdkPaymentId);

      // Determine source platform
      const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';

      // Step 2: Store payment details in Supabase via API (no Onchain.fi call)
      const response = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: sdkPaymentId, // Pass SDK's paymentId
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
        throw new Error((data as any).error || 'Failed to store payment');
      }

      console.log('[useX402Payment] Payment stored in DB:', sdkPaymentId);

      return {
        paymentId: sdkPaymentId,
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
   * Update settlement status in DB
   * SDK verify() already auto-settles - this just updates Supabase
   */
  const settlePayment = async (
    paymentId: string,
    _paymentHeader: string // Keep param for interface compatibility
  ) => {
    setIsSettling(true);
    try {
      console.log('[useX402Payment] Updating settled status:', { paymentId });

      // SDK verify() already settled via autoSettle=true
      // Just update Supabase status
      const response = await fetch('/api/x402/update-mint-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          mintStatus: 'settled',
        }),
      });

      if (!response.ok) {
        console.warn('[useX402Payment] Failed to update DB status to settled');
      }

      console.log('[useX402Payment] Payment settled - ready to mint');
    } catch (error) {
      console.error('[useX402Payment] Settlement status update error:', error);
      // Don't throw - settlement already happened via SDK, this is just DB tracking
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
    recordMintSuccess,
    updateMintStatus,
    isVerifying,
    isSettling,
    isUpdating,
  };
}
