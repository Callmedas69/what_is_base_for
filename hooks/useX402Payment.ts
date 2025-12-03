'use client';

import { useState, useCallback } from 'react';
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

// Fetch with timeout helper
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

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
 * 2. mint() - On-chain NFT mint
 * 3. recordMintSuccess() - Update DB with tokenId + txHash
 */
export function useX402Payment(): UseX402PaymentResult {
  const [isVerifying, setIsVerifying] = useState(false);
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

      // Step 2: Call backend /pay endpoint (proxies to Onchain.fi, keeps API key server-side)
      const x402Response = await fetchWithTimeout(
        '/api/x402/pay',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentHeader,
            to: PAYMENT_CONFIG.RECIPIENT,
            sourceNetwork: 'base',
            destinationNetwork: 'base',
            expectedAmount: amount,
            expectedToken: 'USDC',
            priority: 'balanced',
          }),
        },
        30000 // 30 second timeout
      );

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
      const response = await fetchWithTimeout(
        '/api/x402/verify',
        {
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
        },
        15000 // 15 second timeout for DB operations
      );

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
        await fetchWithTimeout(
          '/api/x402/verify',
          {
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
          },
          10000 // 10 second timeout for error tracking
        );
      } catch (dbError) {
        // Silent fail - don't block error flow for tracking failure
      }

      throw error;
    } finally {
      setIsVerifying(false);
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

      const response = await fetchWithTimeout(
        '/api/x402/update-mint-status',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            mintStatus: 'minted',
            tokenId: tokenId.toString(),
            txHash,
          }),
        },
        15000 // 15 second timeout
      );

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
      const response = await fetchWithTimeout(
        '/api/x402/update-mint-status',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            mintStatus,
            errorMessage,
            errorCode,
          }),
        },
        15000 // 15 second timeout
      );

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
    recordMintSuccess,
    updateMintStatus,
    isVerifying,
    isUpdating,
  };
}
