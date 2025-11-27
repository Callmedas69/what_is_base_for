'use client';

import { useState } from 'react';
import { useOnchainPay } from '@onchainfi/connect';
import { PAYMENT_CONFIG, CURRENT_NETWORK } from '@/lib/config';

// Map config network names to API network names
const NETWORK_API_NAMES: Record<string, string> = {
  baseSepolia: 'base-sepolia',
  base: 'base',
} as const;
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
 *
 * Correct payment flow for custom mint:
 * 1. verify() - User signs EIP-712 authorization (no funds move)
 * 2. settle() - Payment transferred via Onchain.fi (BEFORE mint)
 * 3. mint() - On-chain NFT mint (after payment secured)
 * 4. recordMintSuccess() - Update DB with tokenId + txHash
 */
export function useX402Payment(): UseX402PaymentResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Use OnchainConnect's two-step payment hook
  const { verify, settle, isVerifying: sdkIsVerifying, isSettling: sdkIsSettling } = useOnchainPay();

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

      // Get API network name (e.g., "base-sepolia" instead of "baseSepolia")
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

      if (!verifyResult.success) {
        console.error('[useX402Payment] Verify failed:', verifyResult.error || verifyResult);
        throw new Error(verifyResult.error || 'Payment verification failed');
      }

      // The SDK returns an x402 header after user signs
      const paymentHeader = verifyResult.x402Header || 'SDK_GENERATED_HEADER';

      // Determine source platform
      const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';

      // Step 2: Store payment details in our database via API
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
   * Settle payment BEFORE minting
   * This transfers funds via Onchain.fi SDK
   * Must be called after verify() and before mint()
   */
  const settlePayment = async (
    paymentId: string,
    paymentHeader: string
  ) => {
    setIsSettling(true);
    try {
      console.log('[useX402Payment] Settling payment (pre-mint):', {
        paymentId,
      });

      // Step 1: Settle via OnchainConnect SDK
      // This completes the payment on-chain
      const settleResult = await settle();

      if (!settleResult.success) {
        throw new Error('Payment settlement failed');
      }

      // Step 2: Update our database with settlement status
      const response = await fetch('/api/x402/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          paymentHeader,
          mintStatus: 'settled', // Payment secured, ready to mint
        }),
      });

      const data: PaymentSettleResponse = await response.json();

      if (!response.ok) {
        throw new Error((data as any).error || 'Payment settlement failed');
      }

      console.log('[useX402Payment] Payment settled successfully - ready to mint');
    } catch (error) {
      console.error('[useX402Payment] Settlement error:', error);
      throw error;
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
