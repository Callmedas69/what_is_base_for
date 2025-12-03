'use client';

import { useState } from 'react';
import { useSignTypedData } from 'wagmi';
import { createWalletClient, custom, parseUnits, encodePacked, keccak256 } from 'viem';
import { base } from 'viem/chains';
import { sdk } from '@farcaster/miniapp-sdk';
import { useFarcaster } from '@/contexts/FarcasterContext';
import { PAYMENT_CONFIG } from '@/lib/config';
import type {
  UseX402PaymentResult,
  PhraseCount,
  FarcasterContext,
  MintStatus,
  PaymentVerifyResponse,
  UpdateMintStatusResponse,
} from '@/types/x402';

// x402 Configuration for Base Mainnet
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
const INTERMEDIATE_ADDRESS = '0xfeb1F8F7F9ff37B94D14c88DE9282DA56b3B1Cb1' as const;

// EIP-712 Domain for USDC on Base (ERC-3009)
const USDC_DOMAIN = {
  name: 'USD Coin',
  version: '2',
  chainId: 8453,
  verifyingContract: USDC_ADDRESS,
} as const;

// ERC-3009 TransferWithAuthorization types
const TRANSFER_AUTH_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const;

/**
 * X402 Payment Hook (Standalone Implementation)
 *
 * Uses manual EIP-712 signing + x402 API for payments.
 * Works with both RainbowKit (web) and Farcaster wallet (MiniApp).
 *
 * Payment flow:
 * 1. verifyPayment() - User signs EIP-712 authorization + API verify/settle
 * 2. settlePayment() - Already settled by API (just for logging)
 * 3. mint() - On-chain NFT mint
 * 4. recordMintSuccess() - Update DB with tokenId + txHash
 */
export function useX402Payment(): UseX402PaymentResult {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { isFarcaster } = useFarcaster();
  const { signTypedDataAsync } = useSignTypedData();

  /**
   * Create EIP-712 signature for x402 payment
   */
  const createX402Signature = async (
    amount: string,
    walletAddress: string
  ): Promise<{ signature: string; authorization: any; paymentHeader: string }> => {
    // Generate unique nonce using keccak256(address + timestamp)
    const nonce = keccak256(
      encodePacked(
        ['address', 'uint256'],
        [walletAddress as `0x${string}`, BigInt(Date.now())]
      )
    );

    const now = Math.floor(Date.now() / 1000);
    const authorization = {
      from: walletAddress as `0x${string}`,
      to: INTERMEDIATE_ADDRESS,
      value: parseUnits(amount, 6), // USDC has 6 decimals
      validAfter: BigInt(0),
      validBefore: BigInt(now + 3600), // 1 hour validity
      nonce,
    };

    let signature: string;

    if (isFarcaster) {
      // MiniApp: Use Farcaster wallet provider
      console.log('[useX402Payment] Signing with Farcaster wallet...');
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) {
        throw new Error('Farcaster wallet not available');
      }
      const client = createWalletClient({
        chain: base,
        transport: custom(provider),
        account: walletAddress as `0x${string}`,
      });

      signature = await client.signTypedData({
        domain: USDC_DOMAIN,
        types: TRANSFER_AUTH_TYPES,
        primaryType: 'TransferWithAuthorization',
        message: authorization,
      });
    } else {
      // Web: Use wagmi (RainbowKit)
      console.log('[useX402Payment] Signing with RainbowKit wallet...');
      signature = await signTypedDataAsync({
        domain: USDC_DOMAIN,
        types: TRANSFER_AUTH_TYPES,
        primaryType: 'TransferWithAuthorization',
        message: authorization,
      });
    }

    // Create base64-encoded payment header
    const paymentHeader = Buffer.from(
      JSON.stringify({
        x402Version: 1,
        scheme: 'exact',
        network: 'base',
        payload: {
          signature,
          authorization: {
            from: authorization.from,
            to: authorization.to,
            value: authorization.value.toString(),
            validAfter: authorization.validAfter.toString(),
            validBefore: authorization.validBefore.toString(),
            nonce: authorization.nonce,
          },
        },
      })
    ).toString('base64');

    return { signature, authorization, paymentHeader };
  };

  /**
   * Process payment with x402 protocol
   * Signs EIP-712 authorization and calls x402 API
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
        isFarcaster,
      });

      // Step 1: Create EIP-712 signature
      console.log('[useX402Payment] Creating EIP-712 signature...');
      const { paymentHeader } = await createX402Signature(amount, walletAddress);
      console.log('[useX402Payment] Signature created, calling x402 API...');

      // Step 2: Call x402 /pay endpoint (verify + settle in one call)
      const x402Response = await fetch('https://api.onchain.fi/v1/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          paymentHeader,
          to: PAYMENT_CONFIG.RECIPIENT,
          sourceNetwork: 'base',
          destinationNetwork: 'base',
          expectedAmount: amount,
          expectedToken: 'USDC',
          priority: 'balanced',
        }),
      });

      const x402Data = await x402Response.json();

      if (!x402Response.ok || x402Data.status !== 'success') {
        console.error('[useX402Payment] x402 API error:', x402Data);
        throw new Error(x402Data.error || x402Data.message || 'Payment settlement failed');
      }

      console.log('[useX402Payment] x402 API success:', x402Data);

      // Generate paymentId from txHash
      const paymentId = x402Data.data?.txHash || `pay_${Date.now()}`;
      const txHash = x402Data.data?.txHash || '';

      console.log('[useX402Payment] Payment successful, txHash:', txHash);

      // Determine source platform
      const sourcePlatform = farcasterContext?.fid ? 'farcaster_miniapp' : 'web';

      // Store payment details in Supabase
      const response = await fetch('/api/x402/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          paymentHeader: txHash,
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
        paymentHeader: txHash,
      };
    } catch (error) {
      console.error('[useX402Payment] Payment error:', error);

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
   * x402 API already handles settlement - this is just for debugging
   */
  const settlePayment = async (paymentId: string, _paymentHeader: string) => {
    setIsSettling(true);
    try {
      // x402 API already handles settlement - this is just for logging
      console.log('[useX402Payment] Settlement confirmed (handled by x402 API):', { paymentId });
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
