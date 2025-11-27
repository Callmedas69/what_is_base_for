"use client";

import { RegularMint } from "./RegularMint";
import { CustomMint } from "./CustomMint";
import { FarcasterGate } from "./FarcasterGate";

interface MintSectionProps {
  isConnected: boolean;
  isProcessing: boolean;
  mintType: "regular" | "custom" | null;
  phrases: string[];
  alreadyMintedRegular: boolean;
  regularMintedCount: number;
  maxRegularMints: number;
  remainingCustomMints: number;
  isPaused: boolean;
  isSoldOut: boolean;
  walletAddress?: string;
  onPhrasesChange: (phrases: string[]) => void;
  onRegularMint: () => void;
  onCustomMint: (paymentData: { paymentId: string; paymentHeader: string }) => void;
}

export function MintSection({
  isConnected,
  isProcessing,
  mintType,
  phrases,
  alreadyMintedRegular,
  regularMintedCount,
  maxRegularMints,
  remainingCustomMints,
  isPaused,
  isSoldOut,
  walletAddress,
  onPhrasesChange,
  onRegularMint,
  onCustomMint,
}: MintSectionProps) {
  return (
    <div className="space-y-6">
      {/* Free mint with Farcaster follow gate */}
      <FarcasterGate>
        <RegularMint
          isConnected={isConnected}
          isProcessing={isProcessing}
          isMinting={isProcessing && mintType === "regular"}
          alreadyMinted={alreadyMintedRegular}
          isPaused={isPaused}
          isSoldOut={isSoldOut}
          mintedCount={regularMintedCount}
          maxMints={maxRegularMints}
          onMint={onRegularMint}
        />
      </FarcasterGate>

      <div className="border-t border-[#eef0f3]" />

      {/* Custom mint - no gate required */}
      <CustomMint
        isConnected={isConnected}
        isProcessing={isProcessing}
        isMinting={isProcessing && mintType === "custom"}
        phrases={phrases}
        isPaused={isPaused}
        isSoldOut={isSoldOut}
        walletAddress={walletAddress}
        remainingMints={remainingCustomMints}
        onPhrasesChange={onPhrasesChange}
        onMint={onCustomMint}
      />
    </div>
  );
}
