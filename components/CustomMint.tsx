"use client";

import { useState, useEffect, useRef } from "react";
import { useBalance } from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { PHRASE_CONFIG, MESSAGES, PAYMENT_CONFIG } from "@/lib/config";
import { PhraseSelector } from "./PhraseSelector";
import { useX402Payment } from "@/hooks/useX402Payment";
import type { PhraseCount } from "@/types/x402";

// USDC on Base Mainnet
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

interface CustomMintProps {
  isConnected: boolean;
  isProcessing: boolean;
  isMinting: boolean;
  phrases: string[];
  isPaused: boolean;
  isSoldOut: boolean;
  walletAddress?: string;
  remainingMints: number;
  onPhrasesChange: (phrases: string[]) => void;
  onMint: (paymentData: { paymentId: string; paymentHeader: string }) => void;
}

export function CustomMint({
  isConnected,
  isProcessing,
  isMinting,
  phrases,
  isPaused,
  isSoldOut,
  walletAddress,
  remainingMints,
  onPhrasesChange,
  onMint,
}: CustomMintProps) {
  const [phraseCount, setPhraseCount] = useState<PhraseCount>(3);

  // Prevent hydration mismatch - treat as not connected on server
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const clientConnected = mounted && isConnected;

  const { verifyPayment, updateMintStatus, isVerifying } = useX402Payment();

  // Ref to prevent double verify and store verified payment data
  const paymentFlowRef = useRef<{
    inProgress: boolean;
    paymentId: string | null;
    paymentHeader: string | null;
  }>({ inProgress: false, paymentId: null, paymentHeader: null });

  // Check USDC balance
  const { data: usdcBalance } = useBalance({
    address: walletAddress as `0x${string}` | undefined,
    token: USDC_ADDRESS,
    query: {
      enabled: !!walletAddress && clientConnected,
    },
  });

  // Calculate if user has enough USDC
  const currentPrice = PAYMENT_CONFIG.PRICES[phraseCount];
  const requiredAmount = parseUnits(currentPrice, 6); // USDC has 6 decimals
  const hasEnoughBalance = usdcBalance?.value ? usdcBalance.value >= requiredAmount : false;
  const insufficientBalance = !!(clientConnected && walletAddress && !hasEnoughBalance);

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index] = value;
    onPhrasesChange(newPhrases);
  };

  const handlePayAndMint = async () => {
    // Guard: Prevent double verify
    if (paymentFlowRef.current.inProgress) {
      console.log("[CustomMint] Payment flow already in progress, ignoring duplicate call");
      return;
    }

    if (!clientConnected || !walletAddress) {
      toast.error(MESSAGES.CONNECT_WALLET);
      return;
    }

    if (isPaused) {
      toast.error("Minting is currently paused. Please try again later.");
      return;
    }

    if (isSoldOut) {
      toast.error("Collection is sold out!");
      return;
    }

    if (remainingMints <= 0) {
      toast.error("You've reached the maximum custom mints (20/20)");
      return;
    }

    // Get active phrases based on selected count
    const activePhrases = phrases.slice(0, phraseCount);

    // Validate that all selected phrases are filled
    const emptyPhrases = activePhrases.filter((p) => !p.trim());
    if (emptyPhrases.length > 0) {
      toast.error(`Please fill in all ${phraseCount} phrase(s) before minting.`);
      return;
    }

    // Validate phrase length
    const invalidPhrases = activePhrases.filter(
      (p) => p.length > PHRASE_CONFIG.MAX_LENGTH
    );
    if (invalidPhrases.length > 0) {
      toast.error(`Each phrase must be ${PHRASE_CONFIG.MAX_LENGTH} characters or less.`);
      return;
    }

    // Lock payment flow
    paymentFlowRef.current = { inProgress: true, paymentId: null, paymentHeader: null };

    try {
      // Step 1: Verify payment (user signs EIP-712)
      console.log("[CustomMint] Step 1: Verifying payment...");
      const verifyResult = await verifyPayment(
        phraseCount,
        activePhrases,
        walletAddress
      );

      // Store in ref immediately to prevent overwrites
      paymentFlowRef.current.paymentId = verifyResult.paymentId;
      paymentFlowRef.current.paymentHeader = verifyResult.paymentHeader;

      // Step 2: Trigger mint (payment already settled by x402 API)
      onMint({
        paymentId: paymentFlowRef.current.paymentId!,
        paymentHeader: paymentFlowRef.current.paymentHeader!,
      });
    } catch (error) {
      console.error("[CustomMint] Payment/mint failed:", error);

      // Record failure in database if we have a payment ID
      const failedPaymentId = paymentFlowRef.current.paymentId;
      if (failedPaymentId) {
        try {
          await updateMintStatus(
            failedPaymentId,
            "failed",
            error instanceof Error ? error.message : "Payment failed",
            "PAYMENT_OR_SETTLE_FAILED"
          );
        } catch (statusError) {
          console.error("[CustomMint] Failed to update status:", statusError);
        }
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      );
    } finally {
      // Reset ref after flow completes (success or failure)
      paymentFlowRef.current = { inProgress: false, paymentId: null, paymentHeader: null };
    }
  };

  const maxedOut = remainingMints <= 0;
  const isDisabled = !clientConnected || isProcessing || isVerifying || isPaused || isSoldOut || maxedOut || insufficientBalance;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
        <h3 className="text-lg font-semibold uppercase text-[#0a0b0d]">
          CUSTOM MINT
        </h3>
        <p className="text-sm md:text-xs text-[#5b616e] italic">
          {clientConnected && `(${remainingMints} remaining)`}
        </p>
      </div>

      {/* Phrase Count Selector */}
      <PhraseSelector
        selected={phraseCount}
        onSelect={setPhraseCount}
        disabled={isDisabled}
      />

      {/* Phrase Inputs */}
      <div className="space-y-3 md:space-y-2">
        {[0, 1, 2].map((index) => (
          <div key={index} className="relative">
            <input
              type="text"
              value={phrases[index] || ""}
              onChange={(e) => handlePhraseChange(index, e.target.value)}
              placeholder={PHRASE_CONFIG.PLACEHOLDER[index]}
              maxLength={PHRASE_CONFIG.MAX_LENGTH}
              disabled={isProcessing || isVerifying || index >= phraseCount}
              className={`w-full rounded-lg border px-4 pr-14 py-3 md:py-2.5 text-[#0a0b0d] text-[10px] italic placeholder-[#b1b7c3] focus:border-[#0000ff] focus:outline-none transition-all ${
                index >= phraseCount
                  ? "border-[#eef0f3] bg-[#f9fafb] opacity-50 cursor-not-allowed"
                  : "border-[#dee1e7] bg-white hover:border-[#b1b7c3]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {index < phraseCount && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] italic text-[#5b616e]/80 pointer-events-none">
                {phrases[index]?.length || 0}/{PHRASE_CONFIG.MAX_LENGTH}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Pay & Mint Button */}
      <button
        onClick={handlePayAndMint}
        disabled={isDisabled}
        className="w-full rounded-lg bg-[#0000ff] px-6 py-3.5 md:py-3 font-medium text-white transition-all hover:bg-[#3c8aff] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
      >
        {!clientConnected
          ? "Wallet Required"
          : isVerifying
          ? MESSAGES.PAYMENT_VERIFYING
          : isMinting
          ? MESSAGES.MINTING
          : isPaused
          ? "Paused"
          : isSoldOut
          ? "Sold Out"
          : maxedOut
          ? "Max Reached"
          : insufficientBalance
          ? MESSAGES.INSUFFICIENT_BALANCE
          : `Pay ${currentPrice} USDC & Mint`}
      </button>

    </div>
  );
}
