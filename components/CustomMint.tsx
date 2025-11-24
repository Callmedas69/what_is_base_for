"use client";

import { useState } from "react";
import { PHRASE_CONFIG, MESSAGES, PAYMENT_CONFIG } from "@/lib/config";
import { PhraseSelector } from "./PhraseSelector";
import { useX402Payment } from "@/hooks/useX402Payment";
import { useFarcasterContext } from "@/hooks/useFarcasterContext";
import type { PhraseCount } from "@/types/x402";

interface CustomMintProps {
  isConnected: boolean;
  isProcessing: boolean;
  isMinting: boolean;
  phrases: string[];
  isPaused: boolean;
  isSoldOut: boolean;
  walletAddress?: string;
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
  onPhrasesChange,
  onMint,
}: CustomMintProps) {
  const [phraseCount, setPhraseCount] = useState<PhraseCount>(3);

  const { verifyPayment, isVerifying } = useX402Payment();
  const farcasterContext = useFarcasterContext();

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index] = value;
    onPhrasesChange(newPhrases);
  };

  const handlePayAndMint = async () => {
    if (!isConnected || !walletAddress) {
      alert(MESSAGES.CONNECT_WALLET);
      return;
    }

    if (isPaused) {
      alert("Minting is currently paused. Please try again later.");
      return;
    }

    if (isSoldOut) {
      alert("Collection is sold out!");
      return;
    }

    // Get active phrases based on selected count
    const activePhrases = phrases.slice(0, phraseCount);

    // Validate that all selected phrases are filled
    const emptyPhrases = activePhrases.filter((p) => !p.trim());
    if (emptyPhrases.length > 0) {
      alert(`Please fill in all ${phraseCount} phrase(s) before minting.`);
      return;
    }

    // Validate phrase length
    const invalidPhrases = activePhrases.filter(
      (p) => p.length > PHRASE_CONFIG.MAX_LENGTH
    );
    if (invalidPhrases.length > 0) {
      alert(
        `Each phrase must be ${PHRASE_CONFIG.MAX_LENGTH} characters or less.`
      );
      return;
    }

    try {
      // Verify payment with x402
      const paymentData = await verifyPayment(
        phraseCount,
        activePhrases,
        walletAddress,
        farcasterContext
      );

      // Trigger mint with payment data
      onMint(paymentData);
    } catch (error) {
      console.error("[CustomMint] Payment verification failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Payment verification failed. Please try again."
      );
    }
  };

  const currentPrice = PAYMENT_CONFIG.PRICES[phraseCount];
  const isDisabled = !isConnected || isProcessing || isVerifying || isPaused || isSoldOut;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold uppercase text-[#0a0b0d]">
          Custom Mint (Paid)
        </h3>
        <p className="text-sm text-[#5b616e] italic">
          {isPaused
            ? "⚠️ Minting is paused"
            : isSoldOut
            ? "⚠️ Sold out"
            : `Create your own NFT with custom phrases • Pay with USDC`}
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
          <input
            key={index}
            type="text"
            value={phrases[index] || ""}
            onChange={(e) => handlePhraseChange(index, e.target.value)}
            placeholder={PHRASE_CONFIG.PLACEHOLDER[index]}
            maxLength={PHRASE_CONFIG.MAX_LENGTH}
            disabled={isProcessing || isVerifying || index >= phraseCount}
            className={`w-full rounded-lg border px-4 py-3 md:py-2.5 text-[#0a0b0d] placeholder-[#b1b7c3] focus:border-[#0000ff] focus:outline-none transition-all ${
              index >= phraseCount
                ? "border-[#eef0f3] bg-[#f9fafb] opacity-50 cursor-not-allowed"
                : "border-[#dee1e7] bg-white hover:border-[#b1b7c3]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {/* Character Counter for Active Inputs */}
      <div className="flex justify-between text-xs text-[#5b616e]">
        {[0, 1, 2].slice(0, phraseCount).map((index) => (
          <div key={index}>
            Phrase {index + 1}: {phrases[index]?.length || 0}/{PHRASE_CONFIG.MAX_LENGTH}
          </div>
        ))}
      </div>

      {/* Farcaster Badge (if applicable) */}
      {farcasterContext.isFarcaster && farcasterContext.username && (
        <div className="flex items-center gap-2 rounded-lg bg-[#855DCD]/5 px-3 py-2 border border-[#855DCD]/20">
          <span className="text-xs font-medium text-[#855DCD]">
            🎭 Minting as @{farcasterContext.username}
          </span>
        </div>
      )}

      {/* Pay & Mint Button */}
      <button
        onClick={handlePayAndMint}
        disabled={isDisabled}
        className="w-full rounded-lg bg-[#0000ff] px-6 py-3.5 md:py-3 font-medium text-white transition-all hover:bg-[#3c8aff] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
      >
        {!isConnected
          ? "Connect Wallet"
          : isVerifying
          ? MESSAGES.PAYMENT_VERIFYING
          : isMinting
          ? MESSAGES.MINTING
          : isPaused
          ? "Paused"
          : isSoldOut
          ? "Sold Out"
          : `Pay ${currentPrice} USDC & Mint`}
      </button>

      {/* Payment Info */}
      {isConnected && !isPaused && !isSoldOut && (
        <div className="rounded-lg bg-[#eef0f3] px-4 py-3 text-xs text-[#5b616e] space-y-1">
          <p className="font-medium text-[#0a0b0d]">💳 Payment Details:</p>
          <p>• Amount: {currentPrice} USDC</p>
          <p>• Network: Base</p>
          <p>• Token: USDC (stablecoin)</p>
          <p className="text-[10px] mt-2 italic">
            Payment is processed securely via x402 protocol
          </p>
        </div>
      )}
    </div>
  );
}
