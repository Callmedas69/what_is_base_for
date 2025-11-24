"use client";

import { MESSAGES } from "@/lib/config";

interface RegularMintProps {
  isConnected: boolean;
  isProcessing: boolean;
  isMinting: boolean;
  alreadyMinted: boolean;
  isPaused: boolean;
  isSoldOut: boolean;
  onMint: () => void;
}

export function RegularMint({
  isConnected,
  isProcessing,
  isMinting,
  alreadyMinted,
  isPaused,
  isSoldOut,
  onMint,
}: RegularMintProps) {
  const getStatusMessage = () => {
    if (isPaused) return "Minting is paused";
    if (isSoldOut) return "Sold out";
    if (alreadyMinted) return "Already minted (1/1)";
    return "Mint with predefined phrases (Max 1 per wallet)";
  };

  const isDisabled =
    !isConnected || isProcessing || alreadyMinted || isPaused || isSoldOut;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
        <h3 className="text-lg font-semibold text-[#0a0b0d] uppercase">
          Regular Mint
        </h3>
        <p className="italic text-sm md:text-xs text-[#5b616e]">
          1 Free mint pre-define base&apos;s phrases
        </p>
      </div>
      <button
        onClick={onMint}
        disabled={isDisabled}
        className="w-full rounded-lg bg-[#0000ff] px-6 py-3.5 md:py-3 font-medium text-white transition-colors hover:bg-[#3c8aff] disabled:cursor-not-allowed disabled:opacity-30"
      >
        {!isConnected
          ? "Connect Wallet"
          : isMinting
          ? MESSAGES.MINTING
          : alreadyMinted
          ? "Minted"
          : isPaused
          ? "Paused"
          : isSoldOut
          ? "Sold Out"
          : "Mint Regular"}
      </button>
    </div>
  );
}
