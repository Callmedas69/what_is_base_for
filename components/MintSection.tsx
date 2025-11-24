"use client";

import { RegularMint } from "./RegularMint";
import { CustomMint } from "./CustomMint";

interface MintSectionProps {
  isConnected: boolean;
  isProcessing: boolean;
  mintType: "regular" | "custom" | null;
  phrases: string[];
  alreadyMintedRegular: boolean;
  remainingCustomMints: number;
  isPaused: boolean;
  isSoldOut: boolean;
  onPhrasesChange: (phrases: string[]) => void;
  onRegularMint: () => void;
  onCustomMint: () => void;
}

export function MintSection({
  isConnected,
  isProcessing,
  mintType,
  phrases,
  alreadyMintedRegular,
  remainingCustomMints,
  isPaused,
  isSoldOut,
  onPhrasesChange,
  onRegularMint,
  onCustomMint,
}: MintSectionProps) {
  return (
    <div className="space-y-6">
      <RegularMint
        isConnected={isConnected}
        isProcessing={isProcessing}
        isMinting={isProcessing && mintType === "regular"}
        alreadyMinted={alreadyMintedRegular}
        isPaused={isPaused}
        isSoldOut={isSoldOut}
        onMint={onRegularMint}
      />

      <div className="border-t border-[#eef0f3]" />

      <CustomMint
        isConnected={isConnected}
        isProcessing={isProcessing}
        isMinting={isProcessing && mintType === "custom"}
        phrases={phrases}
        remainingMints={remainingCustomMints}
        isPaused={isPaused}
        isSoldOut={isSoldOut}
        onPhrasesChange={onPhrasesChange}
        onMint={onCustomMint}
      />
    </div>
  );
}
