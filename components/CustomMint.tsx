"use client";

import { PHRASE_CONFIG, MESSAGES } from "@/lib/config";

interface CustomMintProps {
  isConnected: boolean;
  isProcessing: boolean;
  isMinting: boolean;
  phrases: string[];
  remainingMints: number;
  isPaused: boolean;
  isSoldOut: boolean;
  onPhrasesChange: (phrases: string[]) => void;
  onMint: () => void;
}

export function CustomMint({
  isConnected,
  isProcessing,
  isMinting,
  phrases,
  remainingMints,
  isPaused,
  isSoldOut,
  onPhrasesChange,
  onMint,
}: CustomMintProps) {
  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...phrases];
    newPhrases[index] = value;
    onPhrasesChange(newPhrases);
  };

  const getStatusMessage = () => {
    if (isPaused) return "Minting is paused";
    if (isSoldOut) return "Sold out";
    if (remainingMints <= 0) return "Quota reached (10/10)";
    return `Create your own NFT with custom phrases (Remaining: ${remainingMints}/10)`;
  };

  const quotaReached = remainingMints <= 0;
  const isDisabled =
    !isConnected || isProcessing || quotaReached || isPaused || isSoldOut;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
        <h3 className="text-lg font-semibold uppercase text-[#0a0b0d]">
          Custom Mint
        </h3>
        <p
          className={`text-sm md:text-xs italic ${
            quotaReached || isPaused || isSoldOut
              ? "text-[#fc401f]"
              : "text-[#5b616e]"
          }`}
        >
          {getStatusMessage()}
        </p>
      </div>

      <div className="space-y-3 md:space-y-2">
        {[0, 1, 2].map((index) => (
          <input
            key={index}
            type="text"
            value={phrases[index]}
            onChange={(e) => handlePhraseChange(index, e.target.value)}
            placeholder={PHRASE_CONFIG.PLACEHOLDER[index]}
            maxLength={PHRASE_CONFIG.MAX_LENGTH}
            disabled={isProcessing}
            className="w-full rounded-lg border border-[#dee1e7] bg-white px-4 py-3 md:py-2.5 text-[#0a0b0d] placeholder-[#b1b7c3] focus:border-[#0000ff] focus:outline-none disabled:opacity-50"
          />
        ))}
      </div>

      <button
        onClick={onMint}
        disabled={isDisabled}
        className="w-full rounded-lg bg-[#3c8aff] px-6 py-3.5 md:py-3 font-medium text-white transition-colors hover:bg-[#0000ff] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {!isConnected
          ? "Connect Wallet"
          : isMinting
          ? MESSAGES.MINTING
          : quotaReached
          ? "Quota Reached"
          : isPaused
          ? "Paused"
          : isSoldOut
          ? "Sold Out"
          : "Mint Custom"}
      </button>
    </div>
  );
}
